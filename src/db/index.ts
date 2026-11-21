import "server-only";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

export type DB = MySql2Database<typeof schema>;

const g = globalThis as unknown as { __pfPool?: mysql.Pool; __pfDb?: DB };

/** True when a MySQL connection is configured (otherwise the storefront uses mock data). */
export const hasDatabase = !!process.env.DATABASE_URL;

export function db(): DB {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!g.__pfDb) {
    g.__pfPool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: Number(process.env.DB_POOL_SIZE ?? 5),
      timezone: "Z",
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
    });
    g.__pfDb = drizzle(g.__pfPool, { schema, mode: "default" });
  }
  return g.__pfDb;
}

export * as t from "./schema";
