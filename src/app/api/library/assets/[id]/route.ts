// src/app/api/library/assets/[id]/route.ts

import { NextResponse } from "next/server";
import { one, query } from "@/lib/db";
import { requireAuth } from "@/lib/guard";
import { deleteLibraryAsset } from "@/lib/storage";

/** Админ-авторизация */
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

/** Строгая проверка UUID v4 */
function isUuidV4(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * ВАЖНО: второй аргумент — ровно { params: Promise<{ id: string }> }
 * Это удовлетворяет проверке типов Next 15.5.x.
 */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1) Права
    const authRes = await checkAdminAuth();
    if (!authRes.ok) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    // 2) Достаём id (params — PROMISE!)
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing asset ID" }, { status: 400 });
    }
    if (!isUuidV4(id)) {
      return NextResponse.json({ error: "Invalid asset ID format" }, { status: 400 });
    }

    // 3) Берём ключи до удаления
    const asset = await one<{ file_key: string; thumbnail_key: string | null }>(
      `SELECT file_key, thumbnail_key FROM library_assets WHERE id = $1`,
      [id]
    );
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // 4) Удаляем запись
    const { rowCount } = await query(`DELETE FROM library_assets WHERE id = $1`, [id]); // <<< 1. ДЕСТРУКТУРИРОВАТЬ
    if (rowCount === 0) { // <<< 2. ПРОВЕРЯТЬ
      console.warn(`[DELETE /api/library/assets/${id}] Row not deleted from DB (rowCount=0).`);
      // продолжаем чистить файлы
    }

    // 5) Удаляем файлы из S3/MinIO
    const keysToDelete: string[] = [];
    if (asset.file_key) keysToDelete.push(asset.file_key);
    if (asset.thumbnail_key && asset.thumbnail_key !== asset.file_key) {
      keysToDelete.push(asset.thumbnail_key);
    }

    if (keysToDelete.length > 0) {
      try {
        await deleteLibraryAsset(keysToDelete);
      } catch (e) {
        console.error(`[DELETE /api/library/assets/${id}] Storage cleanup failed:`, e);
        return NextResponse.json({
          success: true,
          deletedId: id,
          storageCleanup: "failed",
        });
      }
    }

    // 6) Ок
    return NextResponse.json({
      success: true,
      deletedId: id,
      storageCleanup: "ok",
    });
  } catch (err) {
    console.error(`[DELETE /api/library/assets/:id] error:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
