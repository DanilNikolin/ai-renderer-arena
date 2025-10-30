// src/app/api/admin/history/route.ts
import { NextResponse } from "next/server";
import { query, one } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// --- (ТИП ОБНОВЛЁН) ---
export type AuditHistoryRow = {
  id: string;
  created_at: string;
  original_saved_url: string | null;
  stored_image_url: string | null;
  prompt_raw: string | null;
  gpt_template: string | null;
  status: string | null;
  error_message: string | null;
  // --- ДОБАВЛЕНО ---
  model: string | null;
  guidance_scale: number | null;
  num_steps: number | null;
  seed_used: string | null; // bigint вернется как string
  window_view: string | null;
  door_view: string | null;
  // --- КОНЕЦ ---
};

// --- (Копипаста checkAdminAuth) ---
type AdminAuth = { sub: string };
type AdminAuthResult =
  | { ok: true; auth: AdminAuth }
  | { ok: false; status: number; error: string };

async function checkAdminAuth(): Promise<AdminAuthResult> {
  const auth = await requireAuth();
  if (!auth?.sub) {
    return { ok: false, status: 401, error: "Not authenticated" };
  }
  const account = await one<{ is_admin: boolean }>(
    `SELECT is_admin FROM accounts WHERE id = $1`,
    [auth.sub]
  );
  if (!account?.is_admin) {
    return { ok: false, status: 403, error: "Not an admin" };
  }
  return { ok: true, auth: { sub: auth.sub } };
}
// --- (Конец копипасты) ---

export async function GET() {
  try {
    // 1. Защита
    const authRes = await checkAdminAuth();
    if (!authRes.ok) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    // 2. (ЗАПРОС ОБНОВЛЁН)
    const { rows } = await query<AuditHistoryRow>(
      `SELECT
         id,
         created_at,
         original_saved_url,
         stored_image_url,
         prompt_raw,
         gpt_template,
         status,
         error_message,
         -- ДОБАВЛЕНО --
         model,
         guidance_scale,
         num_steps,
         seed_used,
         window_view,
         door_view
         -- КОНЕЦ --
       FROM external_request_audit
       ORDER BY created_at DESC
       LIMIT 100`,
      []
    );

    // 3. Ответ
    return NextResponse.json(rows);
  } catch (err: unknown) {
    console.error("[admin/history] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}