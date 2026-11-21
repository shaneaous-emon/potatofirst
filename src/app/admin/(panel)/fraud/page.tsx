import Link from "next/link";
import { count, desc, or, eq, ne, sql } from "drizzle-orm";
import { ShieldAlert, CheckCircle, Ban, AlertTriangle } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import {
  Forbidden,
  PageHeader,
  RiskBadge,
  Table,
  Td,
  btn,
  taka,
  fmtDate,
  Card,
  StatCard,
} from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { fraudDecisionAction } from "@/app/admin/_actions/orders";

export const metadata = { title: "Fraud Review" };

export default async function FraudReviewPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "fraud.view")) return <Forbidden perm="fraud.view" />;

  const d = db();
  const rows = await d
    .select()
    .from(t.orders)
    .where(
      or(
        ne(t.orders.riskLevel, "low"),
        ne(t.orders.fraudDecision, "none"),
        eq(t.orders.status, "pending")
      )
    )
    .orderBy(desc(t.orders.riskScore), desc(t.orders.createdAt))
    .limit(50);

  const highRiskCount = rows.filter((r) => r.riskLevel === "high").length;
  const mediumRiskCount = rows.filter((r) => r.riskLevel === "medium").length;
  const heldCount = rows.filter((r) => r.fraudDecision === "hold").length;

  const editable = can(admin.permissions, "fraud.decide");

  return (
    <>
      <PageHeader
        title="Fraud Review"
        description="Verify risky orders, address matching and velocity flags before dispatch."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="High Risk Orders"
          value={highRiskCount}
          hint="Requires immediate verification"
          tone="danger"
          icon={<AlertTriangle />}
        />
        <StatCard
          label="Medium Risk"
          value={mediumRiskCount}
          hint="Orders flagged for review"
          tone="warn"
          icon={<ShieldAlert />}
        />
        <StatCard
          label="On Hold"
          value={heldCount}
          hint="Orders pending customer call"
          tone="default"
          icon={<Ban />}
        />
      </div>

      <Card title="Flagged Orders">
        <Table
          head={[
            "Order",
            "Customer",
            "Risk Score",
            "Flags & Reasons",
            "Total",
            "Decision",
            editable ? "Actions" : null,
          ].filter(Boolean)}
          empty="No high or medium risk orders currently detected. All clear!"
        >
          {rows.map((o) => (
            <tr key={o.id} className="hover:bg-cream-50">
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brown-700 hover:underline">
                  #{o.number}
                </Link>
                <span className="block text-[12px] text-ink-muted">{fmtDate(o.createdAt)}</span>
              </Td>
              <Td>
                <div className="font-medium text-ink">{o.name}</div>
                <div className="text-[12px] text-ink-muted">{o.phone}</div>
                <div className="max-w-[200px] truncate text-[11px] text-ink-soft">{o.address}</div>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <RiskBadge level={o.riskLevel} />
                  <span className="text-[12px] font-semibold text-ink">{o.riskScore}/100</span>
                </div>
              </Td>
              <Td className="max-w-[280px]">
                {o.riskReasons && o.riskReasons.length > 0 ? (
                  <ul className="list-disc pl-4 text-[12px] text-sale">
                    {o.riskReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[12px] text-ink-muted">No specific flags</span>
                )}
              </Td>
              <Td className="whitespace-nowrap font-medium text-ink">
                {taka(o.total)}
                <span className="block text-[11px] text-ink-muted">
                  {o.paymentMethod === "cod" ? "Cash on Delivery" : o.paymentMethod.toUpperCase()}
                </span>
              </Td>
              <Td>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${
                    o.fraudDecision === "accepted"
                      ? "bg-green-100 text-green-700"
                      : o.fraudDecision === "rejected"
                        ? "bg-sale/10 text-sale"
                        : o.fraudDecision === "hold"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-cream-200 text-ink-soft"
                  }`}
                >
                  {o.fraudDecision}
                </span>
              </Td>
              {editable && (
                <Td className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <ActionForm action={fraudDecisionAction}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="decision" value="accepted" />
                      <SubmitButton className="h-8 px-2.5 text-[12px] bg-green-600 text-white hover:bg-green-700">
                        Approve
                      </SubmitButton>
                    </ActionForm>
                    <ActionForm action={fraudDecisionAction}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="decision" value="hold" />
                      <SubmitButton className="h-8 px-2.5 text-[12px] bg-orange-600 text-white hover:bg-orange-700">
                        Hold
                      </SubmitButton>
                    </ActionForm>
                    <ActionForm action={fraudDecisionAction}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="decision" value="rejected" />
                      <SubmitButton className="h-8 px-2.5 text-[12px] bg-sale text-white hover:bg-sale/90">
                        Reject
                      </SubmitButton>
                    </ActionForm>
                  </div>
                </Td>
              )}
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
