// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthCookiesOn } from "@/lib/auth";

export async function POST() {
  // returns a response with acc/ref cookies cleared (path=/, sameSite=lax, secure in prod)
  return clearAuthCookiesOn(NextResponse.json({ ok: true }));
}
