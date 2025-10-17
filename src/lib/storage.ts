// src/lib/storage.ts (MinIO/S3 only)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// --- КОНФИГУРАЦИЯ ---
// URL для внутреннего общения между контейнерами (app -> minio)
const endpoint = process.env.S3_ENDPOINT!;        // e.g. http://minio:9000

// URL, который будет использовать БРАУЗЕР для доступа к MinIO
const publicUrl = process.env.S3_PUBLIC_URL!;     // e.g. http://localhost:9002

const region = process.env.S3_REGION || "local";
const bucket = process.env.S3_BUCKET!;
const accessKeyId = process.env.S3_ACCESS_KEY!;
const secretAccessKey = process.env.S3_SECRET_KEY!;

const s3 = new S3Client({
  endpoint,
  region,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true", // Обязательно true для MinIO
  credentials: { accessKeyId, secretAccessKey },
});

// --- УТИЛИТЫ ---
function contentTypeFor(name: string): string {
  const l = name.toLowerCase();
  if (l.endsWith(".png")) return "image/png";
  if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
  if (l.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

// --- ОСНОВНАЯ ФУНКЦИЯ ---
export async function saveImage(buf: Buffer, filename: string): Promise<string> {
  // 1. Загружаем файл в бакет MinIO
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buf,
      ContentType: contentTypeFor(filename),
      // CacheControl не нужен для локальной разработки, но и не мешает
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  // 2. Собираем ПРАВИЛЬНЫЙ, ПОЛНЫЙ URL для фронтенда.
  //    Браузер пойдёт по этому адресу и получит картинку напрямую от MinIO.
  //    Пример: http://localhost:9002/prompt-images/qwen1__....png
  const finalUrl = `${publicUrl}/${bucket}/${filename}`;

  return finalUrl;
}