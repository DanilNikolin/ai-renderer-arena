import { NextResponse } from "next/server";
import { z } from "zod";
import { one, query } from "@/lib/db";
import { hashPassword, hashPak } from "@/lib/auth";

const Body = z.object({
  projectId: z.string().min(2),
  projectNumber: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

function genPak() {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return "pak_" + Array.from({length:40},()=>abc[Math.floor(Math.random()*abc.length)]).join("");
}

export async function POST(req: Request) {
  const { projectId, projectNumber, email, password } = Body.parse(await req.json());
  const clientEmail = email.toLowerCase();

  // upsert project (manual)
  await query(
    `INSERT INTO projects (id, number_alias) VALUES ($1,$2)
     ON CONFLICT (id) DO UPDATE SET number_alias = COALESCE(EXCLUDED.number_alias, projects.number_alias)`,
    [projectId, projectNumber ?? null]
  );

  const pwdHash = await hashPassword(password);
  const pak = genPak();
  const pakHash = await hashPak(pak);

  // create account (unique project_id enforced)
  await query(
    `INSERT INTO accounts (project_id, email, password_hash)
     VALUES ($1,$2,$3)`,
    [projectId, clientEmail, pwdHash]
  );

  // store PAK hash
  await query(
    `INSERT INTO project_access_keys (project_id, key_hash, name)
     VALUES ($1,$2,$3)`,
    [projectId, pakHash, "default"]
  );

  return NextResponse.json({ projectId, pak }, { status: 201 });
}
