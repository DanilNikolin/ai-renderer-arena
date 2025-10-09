// import { NextResponse } from "next/server";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { requireAuth } from "@/lib/guard";

// export const runtime = "nodejs";

// const S3_BUCKET = process.env.S3_BUCKET!;
// const S3_ENDPOINT = process.env.S3_ENDPOINT!;       // e.g. http://minio:9000
// const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL!;   // e.g. http://localhost:9002
// const S3_REGION = process.env.S3_REGION ?? "us-east-1";
// const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID!;
// const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY!;

// const s3 = new S3Client({
//   region: S3_REGION,
//   endpoint: S3_ENDPOINT,
//   forcePathStyle: true,
//   credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
// });

// export async function POST(req: Request) {
//   const auth = await requireAuth();
//   if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const form = await req.formData();
//   const file = form.get("file");
//   if (!(file instanceof File)) {
//     return NextResponse.json({ error: "Missing file" }, { status: 400 });
//   }

//   const buf = Buffer.from(await file.arrayBuffer());
//   const safeName = file.name?.replace(/\s+/g, "_") || "source.png";
//   const key = `${auth.pid}/sources/${Date.now()}_${safeName}`;

//   await s3.send(
//     new PutObjectCommand({
//       Bucket: S3_BUCKET,
//       Key: key,
//       Body: buf,
//       ContentType: file.type || "application/octet-stream",
//       ACL: undefined, // bucket is public-anon per your mc policy
//     })
//   );

//   // Public path-style URL served by MinIO port mapped to host (e.g., 9002 -> 9000)
//   const url = `${S3_PUBLIC_URL}/${S3_BUCKET}/${key}`;
//   return NextResponse.json({ url, key });
// }

// return code 500
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAuth } from "@/lib/guard";

export const runtime = "nodejs";

const S3_BUCKET = process.env.S3_BUCKET;
const S3_ENDPOINT = process.env.S3_ENDPOINT;       // http://minio:9000 inside Docker network
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL;   // http://localhost:9002 for browser
const S3_REGION = process.env.S3_REGION ?? "us-east-1";

// Prefer explicit S3_* vars; fall back to MINIO_ROOT_* if provided
const ACCESS_KEY =
  process.env.S3_ACCESS_KEY_ID ?? process.env.MINIO_ROOT_USER ?? "";
const SECRET_KEY =
  process.env.S3_SECRET_ACCESS_KEY ?? process.env.MINIO_ROOT_PASSWORD ?? "";

function badEnv(msg: string) {
  return NextResponse.json({ error: msg }, { status: 500 });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!S3_BUCKET || !S3_ENDPOINT || !S3_PUBLIC_URL) {
    return badEnv("Missing S3 config. Ensure S3_BUCKET, S3_ENDPOINT, S3_PUBLIC_URL.");
  }
  if (!ACCESS_KEY || !SECRET_KEY) {
    return badEnv("Missing S3 credentials. Set S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY (or MINIO_ROOT_USER/MINIO_ROOT_PASSWORD).");
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const s3 = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT,
    forcePathStyle: true, // MinIO needs path-style addressing
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });

  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = file.name?.replace(/\s+/g, "_") || "source.png";
  const key = `${auth.pid}/sources/${Date.now()}_${safeName}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buf,
        ContentType: file.type || "application/octet-stream",
      })
    );
  } catch (err) {
    // Helpful error for local debugging
    console.error("MinIO upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Public URL the browser can load (port 9002 maps to MinIO’s 9000)
  const url = `${S3_PUBLIC_URL}/${S3_BUCKET}/${key}`;
  return NextResponse.json({ url, key });
}


///------ for debuging
// src/app/api/files/upload/route.ts
// src/app/api/files/upload/route.ts
// import { NextResponse } from "next/server";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import type { MetadataBearer } from "@aws-sdk/types";
// import { requireAuth } from "@/lib/guard";

// export const runtime = "nodejs";

// const S3_BUCKET     = process.env.S3_BUCKET;
// const S3_ENDPOINT   = process.env.S3_ENDPOINT;      // e.g. http://minio:9000
// const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL;    // e.g. http://localhost:9002
// const S3_REGION     = process.env.S3_REGION ?? "us-east-1";
// const ACCESS_KEY    = process.env.S3_ACCESS_KEY_ID ?? process.env.MINIO_ROOT_USER ?? "";
// const SECRET_KEY    = process.env.S3_SECRET_ACCESS_KEY ?? process.env.MINIO_ROOT_PASSWORD ?? "";
// const AUTH_MODE     = process.env.AUTH_MODE ?? "prod";

// function bad(status: number, msg: string) {
//   console.error("[files/upload] ->", status, msg);
//   return NextResponse.json({ error: msg }, { status });
// }

// // mask sensitive values in logs
// function mask(s: string | undefined | null) {
//   if (!s || s.length < 2) return !!s ? "*".repeat(s.length) : "(empty)";
//   return `${s[0]}***(${s.length})***${s[s.length - 1]}`;
// }

// function getHttpStatus(err: unknown): number | undefined {
//   if (typeof err === "object" && err !== null && "$metadata" in err) {
//     const md = (err as MetadataBearer).$metadata;
//     return md?.httpStatusCode;
//   }
//   return undefined;
// }
// function getName(err: unknown): string | undefined {
//   return err instanceof Error ? err.name : undefined;
// }
// function getMessage(err: unknown): string | undefined {
//   return err instanceof Error ? err.message : undefined;
// }

// export async function POST(req: Request) {
//   console.log("[files/upload] START", new Date().toISOString());

//   // 1) Auth (keep as const to satisfy prefer-const)
//   const auth = await requireAuth().catch((e: unknown) => {
//     console.error("[files/upload] requireAuth threw:", e);
//     return null;
//   });

//   console.log("[files/upload] auth", {
//     authed: !!auth,
//     pid: auth?.pid ?? null,
//     mode: auth?.mode ?? null,
//     AUTH_MODE,
//   });

//   // Allow local-dev uploads when not authed and AUTH_MODE=local_dev
//   const pid = auth?.pid ?? (AUTH_MODE === "local_dev" ? "local" : null);
//   if (!pid) return bad(401, "Unauthorized");

//   // 2) Env diagnostics (no secrets)
//   console.log("[files/upload] env", {
//     S3_BUCKET,
//     S3_ENDPOINT,
//     S3_PUBLIC_URL,
//     S3_REGION,
//     ACCESS_KEY_set: !!ACCESS_KEY,
//     SECRET_KEY_set: !!SECRET_KEY,
//     ACCESS_KEY_mask: mask(ACCESS_KEY),
//     SECRET_KEY_mask: mask(SECRET_KEY),
//   });

//   if (!S3_BUCKET || !S3_ENDPOINT || !S3_PUBLIC_URL) {
//     return bad(500, "Missing S3 config: S3_BUCKET, S3_ENDPOINT, S3_PUBLIC_URL");
//   }
//   if (!ACCESS_KEY || !SECRET_KEY) {
//     return bad(500, "Missing S3 credentials (S3_* or MINIO_* not set)");
//   }

//   // 3) File intake
//   let file: unknown;
//   try {
//     const form = await req.formData();
//     file = form.get("file");
//   } catch (e) {
//     console.error("[files/upload] formData error:", e);
//     return bad(400, "Malformed multipart/form-data");
//   }
//   if (!(file instanceof File)) {
//     console.error("[files/upload] no File in form-data:", { type: typeof file });
//     return bad(400, "Missing file");
//   }

//   console.log("[files/upload] file", {
//     name: file.name,
//     type: file.type,
//     size: file.size,
//   });

//   // 4) S3 client (MinIO)
//   const s3 = new S3Client({
//     region: S3_REGION,
//     endpoint: S3_ENDPOINT,
//     forcePathStyle: true, // required for MinIO
//     credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
//   });

//   // 5) Prepare upload
//   let buf: Buffer;
//   try {
//     buf = Buffer.from(await file.arrayBuffer());
//   } catch (e) {
//     console.error("[files/upload] toBuffer error:", e);
//     return bad(400, "Could not read file");
//   }

//   const safeName = (file.name || "source.png").replace(/\s+/g, "_");
//   const key = `${pid}/sources/${Date.now()}_${safeName}`;
//   console.log("[files/upload] put", { bucket: S3_BUCKET, key });

//   // 6) Upload
//   try {
//     const resp = await s3.send(
//       new PutObjectCommand({
//         Bucket: S3_BUCKET,
//         Key: key,
//         Body: buf,
//         ContentType: file.type || "application/octet-stream",
//       })
//     );
//     console.log("[files/upload] put OK", (resp as MetadataBearer).$metadata);
//   } catch (err: unknown) {
//     console.error("[files/upload] put FAILED", {
//       name: getName(err),
//       code: getHttpStatus(err),
//       message: getMessage(err),
//       endpoint: S3_ENDPOINT,
//       bucket: S3_BUCKET,
//     });
//     return bad(500, "Upload failed");
//   }

//   // 7) Public URL back to client
//   const url = `${S3_PUBLIC_URL}/${S3_BUCKET}/${key}`;
//   console.log("[files/upload] DONE url", url);
//   return NextResponse.json({ url, key });
// }

