//D:\Work\Marge 3dims\ai-renderer-arena\src\lib\db.ts
import { Pool, QueryResult, QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

type Row = Record<string, unknown>;
/**
 * Run a query and get the full QueryResult back.
 * Usage: const { rows, rowCount } = await query<MyRow>("SELECT ...", [param]);
 */
export async function query<T extends Row = Row>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> { 
    const res = params
      ? await pool.query<T, unknown[]>(text, params)
      : await pool.query<T>(text);
    return res; 
  }

/** Get a single row (or null) with typing. */
export async function one<T extends Row = Row>(
    text: string,
    params?: unknown[]
  ): Promise<T | null> {
    const { rows } = await query<T>(text, params); 
    return rows[0] ?? null;
  }