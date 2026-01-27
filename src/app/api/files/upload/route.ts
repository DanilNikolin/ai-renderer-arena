
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guard";
import { uploadBuffer, contentTypeFor, sanitizeFilename } from "@/lib/storage";

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
    if (!process.env.S3_ENDPOINT || !process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      console.error("Missing S3 configuration");
      return NextResponse.json({ error: "Server misconfiguration: S3 environment variables missing" }, { status: 500 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    let safeName = sanitizeFilename(file.name || "source.png");
    if (!safeName || safeName.trim() === "") {
      safeName = "source.png";
    }
    const key = `${auth.pid}/sources/${Date.now()}_${safeName}`;
    const contentType = file.type || contentTypeFor(safeName);

    const url = await uploadBuffer(key, buf, contentType);

    return NextResponse.json({ url, key });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
