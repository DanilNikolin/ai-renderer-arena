// src/lib/storage.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

/* =========================
   Конфигурация из окружения
   ========================= */
const endpoint = process.env.S3_ENDPOINT!;
const publicUrl = process.env.S3_PUBLIC_URL!;
const region = process.env.S3_REGION || "us-east-1";
const bucket = process.env.S3_BUCKET!;
const accessKeyId = process.env.S3_ACCESS_KEY!;
const secretAccessKey = process.env.S3_SECRET_KEY!;

const forcePathStyle = (process.env.S3_FORCE_PATH_STYLE ?? "true").toLowerCase() === "true";

export const S3_BUCKET = bucket;
export const S3_PUBLIC_URL = publicUrl;

export const s3 = new S3Client({
  endpoint,
  region,
  forcePathStyle,
  credentials: { accessKeyId, secretAccessKey },
});

/* =========================
   Вспомогалки
   ========================= */

// Нормализуем имя: убираем пробелы/скобки/кириллицу и прочий мусор.
export function sanitizeFilename(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function contentTypeFor(name: string): string {
  const l = name.toLowerCase();
  if (l.endsWith(".png")) return "image/png";
  if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
  if (l.endsWith(".webp")) return "image/webp";
  if (l.endsWith(".gif")) return "image/gif";
  if (l.endsWith(".svg")) return "image/svg+xml";
  if (l.endsWith(".glb")) return "model/gltf-binary";
  if (l.endsWith(".gltf")) return "model/gltf+json";
  if (l.endsWith(".obj")) return "model/obj";
  if (l.endsWith(".mtl")) return "model/mtl";
  return "application/octet-stream";
}

export function getPublicUrl(key: string): string {
  // Для Supabase и path-style URL: S3_PUBLIC_URL уже содержит .../storage/v1/object/public
  // И потом идет имя бакета, потом ключ.
  // Но если S3_PUBLIC_URL=".../state/v1/object/public", то нам надо добавить /{bucket}/{key}
  return `${publicUrl}/${bucket}/${key}`;
}

/* =========================
   API сохранения
   ========================= */

/**
 * Универсальная загрузка буфера по ключу.
 * Не создает бакет (считаем, что он есть).
 */
export async function uploadBuffer(
  key: string,
  buf: Buffer,
  contentType?: string
): Promise<string> {
  const finalContentType = contentType || contentTypeFor(key);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buf,
      ContentType: finalContentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return getPublicUrl(key);
}

/**
 * Сохраняет обычную картинку в корень бакета (Legacy helper)
 */
export async function saveImage(buf: Buffer, filename: string): Promise<string> {
  const clean = sanitizeFilename(filename);
  return uploadBuffer(clean, buf);
}

/**
 * Сохраняет ассет библиотеки в подпапку
 */
export async function saveLibraryAsset(
  buf: Buffer,
  folder: "library/2d" | "library/3d" | "library/thumbs" | "library/textures",
  filename: string
): Promise<string> {
  const clean = sanitizeFilename(filename);
  const key = `${folder}/${clean}`;

  await uploadBuffer(key, buf);
  return key; // Возвращаем ключ, а не URL, т.к. библиотека хранит ключи
}

export async function deleteLibraryAsset(keys: string[]): Promise<void> {
  if (!keys || keys.length === 0) return;

  await s3.send(new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: keys.map(key => ({ Key: key })),
      Quiet: false,
    },
  }));
}