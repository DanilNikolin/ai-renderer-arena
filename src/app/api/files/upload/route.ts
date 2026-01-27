
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guard";
import { uploadBuffer, contentTypeFor } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const safeName = file.name?.replace(/\s+/g, "_") || "source.png";
    const key = `${auth.pid}/sources/${Date.now()}_${safeName}`;
    const contentType = file.type || contentTypeFor(safeName);

    const url = await uploadBuffer(key, buf, contentType);

    return NextResponse.json({ url, key });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
