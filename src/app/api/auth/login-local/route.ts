// src/app/api/auth/login-local/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db"; // or your relative path
import { signAccess, signRefresh, withAuthCookies } from "@/lib/auth";

export async function POST(req: Request) {
  if (process.env.AUTH_MODE !== "local_dev") {
    return NextResponse.json({ error: "Local auth disabled" }, { status: 403 });
  }

  const { projectId } = await req.json();
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  await query(
    `INSERT INTO projects (id) VALUES ($1)
     ON CONFLICT (id) DO NOTHING`,
    [projectId]
  );

  // No accountId in local auth; sign tokens with mode="local_dev"
  const access = signAccess(projectId, "local_dev");
  const refresh = signRefresh(projectId, "local_dev");

  return withAuthCookies(
    NextResponse.json({ projectId, mode: "local_dev" }),
    access,
    refresh
  );
}
