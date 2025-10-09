import { NextResponse } from "next/server";
import { one, query } from "@/lib/db";
import { requireAuth } from "@/lib/guard";

type WorkspaceState = {
  // keep only serializable, durable bits you need to restore
  activeTab: "BASE" | "PRO";
  comparePos: number;
  selectedBaseResultUrl: string | null;
  activeNodeId: string | null;

  // your existing shapes
  baseResults: Array<{
    id: string;
    imageUrl: string;
    parentId?: string | null;
    w?: number; h?: number;
    // add whatever else you need (prompt, params...)
  }>;

  // rootNodeId -> history nodes
  workspaces: Record<string, Array<{
    id: string;
    parentId?: string | null;
    imageUrl: string;
    w?: number; h?: number;
  }>>;
};

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await one<{ state: unknown }>(
    `SELECT state FROM project_workspace_state WHERE project_id = $1`,
    [auth.pid]
  );

  if (!row) return new NextResponse(null, { status: 204 }); // nothing saved yet
  return NextResponse.json(row.state);
}

export async function PUT(req: Request) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { state: WorkspaceState };
  if (!body?.state) return NextResponse.json({ error: "Missing state" }, { status: 400 });

  await query(
    `INSERT INTO project_workspace_state (project_id, state, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (project_id)
     DO UPDATE SET state = EXCLUDED.state, updated_at = now()`,
    [auth.pid, body.state]
  );

  return NextResponse.json({ ok: true });
}
