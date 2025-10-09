import { Pool, QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});


type Row = Record<string, unknown>;
/**
 * Run a query and get typed rows back.
 * Usage: const rows = await query<MyRow>("SELECT ...", [param]);
 */
export async function query<T extends Row = Row>(
    text: string,
    params?: unknown[]            // NOTE: mutable, not ReadonlyArray
  ): Promise<T[]> {
    const res = params
      ? await pool.query<T, unknown[]>(text, params) // specify values type
      : await pool.query<T>(text);                   // 1-arg overload
    return res.rows;
  }

/** Get a single row (or null) with typing. */
export async function one<T extends Row = Row>(
    text: string,
    params?: unknown[]
  ): Promise<T | null> {
    const rows = await query<T>(text, params);
    return rows[0] ?? null;
  }
