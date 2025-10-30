// src/app/api/auth/me/route.ts

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guard";
import { one } from "@/lib/db"; // <<< 1. ИМПОРТИРУЕМ ХЕЛПЕР ДЛЯ БД

export async function GET() {
  const p = await requireAuth();
  if (!p) return NextResponse.json({ authenticated: false });

  const { pid, mode, sub } = p;
  let isAdmin = false; // <<< 2. ПО УМОЛЧАНИЮ НИКТО НЕ АДМИН

  // 3. Если в токене есть ID аккаунта (sub), лезем в базу
  if (sub) {
    const account = await one<{ is_admin: boolean }>(
      `SELECT is_admin FROM accounts WHERE id = $1`,
      [sub]
    );
    // 4. Если нашли и он админ - ставим флаг
    isAdmin = account?.is_admin ?? false;
  }

  // 5. Возвращаем флаг на фронтенд
  return NextResponse.json({
    authenticated: true,
    projectId: pid,
    mode,
    accountId: sub ?? null,
    is_admin: isAdmin, // <<< ВОТ ОН
  });
}