// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guard"; // or your relative path

export async function GET() {
  const p = await requireAuth();                 // 👈 await
  if (!p) return NextResponse.json({ authenticated: false });

  const { pid, mode, sub } = p;                  // now p is AuthClaims, not a Promise
  return NextResponse.json({
    authenticated: true,
    projectId: pid,
    mode,
    accountId: sub ?? null,
  });
}
