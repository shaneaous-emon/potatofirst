import "server-only";
import { and, asc, eq, gt, gte, isNull, or, sql } from "drizzle-orm";
import { t, type DB } from "@/db";

type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];
type MovementType = (typeof t.stockMovements.$inferInsert)["type"];

/**
 * Change on-hand stock for one variant inside a transaction (row lock prevents overselling).
 * Negative qty = stock out. Sales consume batches FEFO (first expiry, first out),
 * skipping expired batches when `blockExpired` is on.
 */
export async function moveStock(
  tx: Tx,
  opts: { variantId: number; qty: number; type: MovementType; reason?: string; reference?: string; adminId?: number | null; batchId?: number | null; blockExpired?: boolean; allowNegative?: boolean },
) {
  const [v] = await tx.select().from(t.productVariants).where(eq(t.productVariants.id, opts.variantId)).for("update");
  if (!v) throw new Error("Variant not found");
  const after = v.stockOnHand + opts.qty;
  if (after < 0 && !opts.allowNegative) throw new Error(`Not enough stock for ${v.sku} (available ${v.stockOnHand})`);
  await tx.update(t.productVariants).set({ stockOnHand: after }).where(eq(t.productVariants.id, v.id));

  if (opts.qty < 0 && !opts.batchId) {
    // FEFO batch consumption
    let need = -opts.qty;
    let bal = v.stockOnHand;
    const now = new Date();
    const batches = await tx
      .select()
      .from(t.inventoryBatches)
      .where(
        and(
          eq(t.inventoryBatches.variantId, v.id),
          gt(t.inventoryBatches.remainingQty, 0),
          opts.blockExpired ? or(isNull(t.inventoryBatches.expiresAt), gte(t.inventoryBatches.expiresAt, now)) : undefined,
        ),
      )
      .orderBy(sql`${t.inventoryBatches.expiresAt} is null`, asc(t.inventoryBatches.expiresAt), asc(t.inventoryBatches.id))
      .for("update");
    for (const b of batches) {
      if (need <= 0) break;
      const take = Math.min(need, b.remainingQty);
      await tx.update(t.inventoryBatches).set({ remainingQty: b.remainingQty - take }).where(eq(t.inventoryBatches.id, b.id));
      await tx.insert(t.stockMovements).values({ variantId: v.id, batchId: b.id, type: opts.type, qty: -take, before: bal, after: bal - take, reason: opts.reason, reference: opts.reference, adminId: opts.adminId ?? null });
      bal -= take;
      need -= take;
    }
    if (need > 0) {
      // stock not tied to a batch (or only expired batches left)
      await tx.insert(t.stockMovements).values({ variantId: v.id, type: opts.type, qty: -need, before: bal, after: bal - need, reason: opts.reason, reference: opts.reference, adminId: opts.adminId ?? null });
    }
    return { before: v.stockOnHand, after };
  }

  if (opts.batchId) {
    const [b] = await tx.select().from(t.inventoryBatches).where(eq(t.inventoryBatches.id, opts.batchId)).for("update");
    if (b) await tx.update(t.inventoryBatches).set({ remainingQty: Math.max(0, b.remainingQty + opts.qty) }).where(eq(t.inventoryBatches.id, b.id));
  }
  await tx.insert(t.stockMovements).values({ variantId: v.id, batchId: opts.batchId ?? null, type: opts.type, qty: opts.qty, before: v.stockOnHand, after, reason: opts.reason, reference: opts.reference, adminId: opts.adminId ?? null });
  return { before: v.stockOnHand, after };
}
