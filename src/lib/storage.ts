// src/lib/storage.ts
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

/* =========================
   Конфигурация из окружения
   ========================= */
const endpoint = process.env.S3_ENDPOINT!;        // напр. http://minio:9000
const publicUrl = process.env.S3_PUBLIC_URL!;     // напр. http://localhost:9000
const region = process.env.S3_REGION || "us-east-1";
const bucket = process.env.S3_BUCKET!;            // напр. prompt-images
const accessKeyId = process.env.S3_ACCESS_KEY!;
const secretAccessKey = process.env.S3_SECRET_KEY!;

// Для MinIO почти всегда нужно path-style. По умолчанию включаем.
const forcePathStyle =
  (process.env.S3_FORCE_PATH_STYLE ?? "true").toLowerCase() === "true";

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
    .replace(/[^\w.\-]+/g, "-") // всё, кроме [a-zA-Z0-9_.-], → "-"
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function contentTypeFor(name: string): string {
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

/** Ленивая проверка/создание бакета, чтобы не ловить NoSuchBucket. */
export async function ensureBucket(b: string = bucket): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: b }));
  } catch (e: unknown) { 
    // если бакета нет — создадим
    
    let code: string | undefined;
    let http: number | undefined;

    if (typeof e === 'object' && e !== null) {
      code = (e as { Code?: string }).Code ?? (e as { name?: string }).name;
      http = (e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    }
    
    if (code === "NoSuchBucket" || code === "NotFound" || http === 404) {
      await s3.send(new CreateBucketCommand({ Bucket: b }));
    } else {
      throw e;
    }
  }
}

/** Публичный URL объекта (для path-style конфигурации MinIO). */
export function getPublicUrl(keyOrFile: string): string {
  // Если тебе нужен virtual-host style — поменяй формирование URL здесь.
  return `${publicUrl}/${bucket}/${keyOrFile}`;
}

/* =========================
   API сохранения
   ========================= */

/**
 * Сохраняет обычную картинку в корень бакета и возвращает ПУБЛИЧНЫЙ URL.
 */
export async function saveImage(buf: Buffer, filename: string): Promise<string> {
  await ensureBucket(bucket);

  const clean = sanitizeFilename(filename);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: clean,
      Body: buf,
      ContentType: contentTypeFor(clean),
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return getPublicUrl(clean);
}

/**
 * Сохраняет ассет библиотеки в подпапку (library/2d | library/3d | library/thumbs | library/textures)
 * и возвращает КЛЮЧ (путь внутри бакета), а не полный URL.
 */
export async function saveLibraryAsset(
  buf: Buffer,
  folder: "library/2d" | "library/3d" | "library/thumbs" | "library/textures", 
  filename: string
): Promise<string> {
  await ensureBucket(bucket);

  const clean = sanitizeFilename(filename);
  const key = `${folder}/${clean}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buf,
      ContentType: contentTypeFor(clean),
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return key; // URL строим отдельно через getPublicUrl(key)
}

/**
 * Удаляет один или несколько объектов из бакета библиотеки.
 * Принимает массив ключей (путей внутри бакета).
 */
export async function deleteLibraryAsset(keys: string[]): Promise<void> {
  if (!keys || keys.length === 0) {
    return; // Нечего удалять
  }

  await ensureBucket(bucket); // Убедимся, что бакет существует

  const command = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: keys.map(key => ({ Key: key })),
      Quiet: false, // Хотим видеть ошибки, если они будут
    },
  });

  try {
    const output = await s3.send(command);
    if (output.Errors && output.Errors.length > 0) {
      console.error("Errors deleting objects from S3:", output.Errors);
      // Можно пробросить ошибку выше, если нужно жестко реагировать
      // throw new Error(`Failed to delete some objects: ${output.Errors[0].Key}`);
    }
    if (output.Deleted && output.Deleted.length > 0) {
       console.log(`Successfully deleted ${output.Deleted.length} objects from S3.`);
    }
  } catch (error) {
    console.error("Failed to execute DeleteObjects command:", error);
    throw error; // Пробрасываем ошибку для обработки выше
  }
}