import jwt, { JwtPayload } from "jsonwebtoken";
import argon2 from "argon2";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Mode = "local_dev" | "prod";
type Typ = "access" | "refresh";

export type AuthClaims = JwtPayload & {
  pid: string;
  mode: Mode;
  typ: Typ;
  sub?: string;
};

const ACCESS_TTL_MIN = Number(process.env.SESSION_TTL_MIN ?? 15);
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TTL_DAYS ?? 14);
const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export async function hashPassword(p: string) { return argon2.hash(p, { type: argon2.argon2id }); }
export async function verifyPassword(p: string, h: string) { return argon2.verify(h, p); }
export async function hashPak(pak: string) { return argon2.hash(pak); }
export async function verifyPak(pak: string, hash: string) { return argon2.verify(hash, pak); }

export function signAccess(pid: string, mode: Mode, sub?: string) {
  return jwt.sign({ pid, mode, typ: "access", sub } satisfies AuthClaims, ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: `${ACCESS_TTL_MIN}m`,
  });
}
export function signRefresh(pid: string, mode: Mode, sub?: string) {
  return jwt.sign({ pid, mode, typ: "refresh", sub } satisfies AuthClaims, REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: `${REFRESH_TTL_DAYS}d`,
  });
}

/** Attach auth cookies to a NextResponse and return it. */
export function withAuthCookies(res: NextResponse, access: string, refresh: string): NextResponse {
  const secure = process.env.AUTH_MODE === "prod";
  const base = { httpOnly: true, sameSite: "lax" as const, secure, path: "/" };
  res.cookies.set({ name: "acc", value: access, ...base });
  res.cookies.set({ name: "ref", value: refresh, ...base });
  return res;
}

/** Clear auth cookies on a NextResponse and return it. */
export function clearAuthCookiesOn(res: NextResponse): NextResponse {
  const secure = process.env.AUTH_MODE === "prod";
  const base = { httpOnly: true, sameSite: "lax" as const, secure, path: "/", maxAge: 0 };
  res.cookies.set({ name: "acc", value: "", ...base });
  res.cookies.set({ name: "ref", value: "", ...base });
  return res;
}

/** Прочитать access-cookie, провалидировать JWT и вернуть { sub } либо null. */
export async function requireAuth(): Promise<{ sub: string } | null> {
  try {
    // ВАЖНО: cookies() теперь async
    const cookieStore = await cookies();
    const acc = cookieStore.get("acc")?.value;
    if (!acc) return null;

    const decoded = jwt.verify(acc, ACCESS_SECRET) as AuthClaims;

    if (decoded.typ !== "access") return null;

    const sub = decoded.sub ?? decoded.pid; // fallback, если sub не пишешь
    if (!sub) return null;

    return { sub: String(sub) };
  } catch {
    return null;
  }
}