// src/lib/storage.ts (MinIO/S3 only)
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.S3_ENDPOINT!;        // e.g. http://minio:9000
const region = process.env.S3_REGION || "local";  // "local" is fine for MinIO
const bucket = process.env.S3_BUCKET!;            // e.g. prompt-images
const accessKeyId = process.env.S3_ACCESS_KEY!;
const secretAccessKey = process.env.S3_SECRET_KEY!;
const proxyBase = process.env.S3_PUBLIC_PROXY_BASE; // set to "/images" if using nginx bridge

const s3 = new S3Client({
  endpoint,
  region,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true", // must be true for MinIO
  credentials: { accessKeyId, secretAccessKey },
});

function contentTypeFor(name: string) {
  const l = name.toLowerCase();
  if (l.endsWith(".png")) return "image/png";
  if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
  if (l.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

export async function saveImage(buf: Buffer, filename: string): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: filename,
    Body: buf,
    ContentType: contentTypeFor(filename),
    CacheControl: "public, max-age=31536000, immutable",
  }));

  // If using nginx bridge (/images -> MinIO), return a stable path:
  if (proxyBase) return `${proxyBase.replace(/\/$/, "")}/${encodeURIComponent(filename)}`;

  // Otherwise return a presigned URL:
  return await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: filename }), { expiresIn: 3600 });
}
