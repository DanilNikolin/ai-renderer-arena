// src/app/api/auth/login-pak/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { one, query } from "@/lib/db";
import { verifyPak, signAccess, signRefresh, withAuthCookies } from "@/lib/auth";

const Body = z.object({
  projectId: z.string().min(1),
  accessKey: z.string().min(1),
  // optional: if you plan multiple keys per project later
  // keyName: z.string().optional(),
});

type AccessKeyRow = {
  id: string;
  key_hash: string;
};

export async function POST(req: Request) {
  const { projectId, accessKey } = Body.parse(await req.json());

  // fetch a PAK for this project (latest one); adjust WHERE if you add named keys
  const ak = await one<AccessKeyRow>(
    `SELECT id, key_hash
       FROM project_access_keys
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
    [projectId]
  );

  if (!ak || !(await verifyPak(accessKey, ak.key_hash))) {
    return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
  }

  // (optional) update last_used_at for auditing
  await query(`UPDATE project_access_keys SET last_used_at = now() WHERE id = $1`, [ak.id]);

  // PAK sessions are project-scoped; no accountId
  const access = signAccess(projectId, "prod");
  const refresh = signRefresh(projectId, "prod");

  return withAuthCookies(
    NextResponse.json({ projectId, via: "pak" }),
    access,
    refresh
  );
}


//If you want login-pak to only work in prod, add:

//if (process.env.AUTH_MODE !== "prod") {
//  return NextResponse.json({ error: "PAK login disabled in non-prod" }, { status: 403 });
//}

//# exchange PAK for tokens
//curl -sX POST http://localhost:3000/api/auth/login-pak \
//  -H 'Content-Type: application/json' \
//  -d '{"projectId":"proj_123","accessKey":"pak_live_..."}' \
//  -c cookies.txt   # saves Set-Cookie

//# call a project-scoped API using the session cookies
//curl -b cookies.txt http://localhost:3000/api/data/things


