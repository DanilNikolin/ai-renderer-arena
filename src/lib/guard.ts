import jwt, { JwtPayload as JwtStd } from "jsonwebtoken";
import { cookies } from "next/headers";

export type AuthClaims = JwtStd & {
  pid: string;
  mode: "local_dev" | "prod";
  typ: "access" | "refresh";
  sub?: string;
};

function isAuthClaims(x: JwtStd | string): x is AuthClaims {
  if (typeof x === "string") return false;
  const a = x as Partial<AuthClaims>;
  const modeOk = a.mode === "local_dev" || a.mode === "prod";
  const typOk = a.typ === "access" || a.typ === "refresh";
  return typeof a.pid === "string" && modeOk && typOk;
}

/** Next 15: cookies() is async → await it */
export async function requireAuth(): Promise<AuthClaims | null> {
  const store = await cookies();                      // 👈 await
  const token = store.get("acc")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtStd | string;
    if (!isAuthClaims(decoded) || decoded.typ !== "access") return null;
    return decoded;
  } catch {
    return null;
  }
}
