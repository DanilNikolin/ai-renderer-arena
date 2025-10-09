// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { verifyPassword, signAccess, signRefresh, withAuthCookies } from "@/lib/auth";

type AccountRow = { id: string; email: string; password_hash: string };

export async function POST(req: Request) {
  const { projectId, email, password } = await req.json();

  const row = await one<AccountRow>(
    `SELECT id, email, password_hash FROM accounts WHERE project_id = $1`,
    [projectId]
  );
  if (!row || row.email !== String(email).toLowerCase()) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if (!(await verifyPassword(String(password), row.password_hash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const access = signAccess(projectId, "prod", row.id);   // <- accountId here
  const refresh = signRefresh(projectId, "prod", row.id);

  return withAuthCookies(
    NextResponse.json({ projectId, accountId: row.id }),
    access,
    refresh
  );
}
