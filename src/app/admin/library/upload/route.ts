import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { one, query } from "@/lib/db";
import { requireAuth } from "@/lib/guard";
import { saveLibraryAsset } from "@/lib/storage"; // если у тебя другой путь (например "@/lib/minio"), поправь импорт

// ---- Явные типы для строгой проверки
type AdminAuth = { sub: string };
type AdminAuthResult =
  | { ok: true; auth: AdminAuth }
  | { ok: false; status: number; error: string };

// ---- Валидация входных полей формы
const BodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["2d_object", "3d_object", "2d_texture"], {
    required_error: "type is required",
    // Обновляем сообщение об ошибке
    invalid_type_error: "type must be '2d_object' | '3d_object' | '2d_texture'",
  }),
  file: z
    .instanceof(File, { message: "file must be provided" })
    .refine((f) => f.size > 0, "Empty file"),
});

// ---- Проверка прав админа (дискриминированный union, исключает null)
async function checkAdminAuth(): Promise<AdminAuthResult> {
  const auth = await requireAuth();
  if (!auth?.sub) {
    return { ok: false, status: 401, error: "Not authenticated" };
  }

  // Проверяем в БД, что аккаунт — админ
  const account = await one<{ is_admin: boolean }>(
    `SELECT is_admin FROM accounts WHERE id = $1`,
    [auth.sub]
  );

  if (!account?.is_admin) {
    return { ok: false, status: 403, error: "Not an admin" };
  }

  return { ok: true, auth: { sub: auth.sub } };
}

// ---- Хелперы для имени файла
function toSafeKebab(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    // 1) Авторизация и права
    const authRes = await checkAdminAuth();
    if (!authRes.ok) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }
    const adminId = authRes.auth.sub;

    // 2) Разбор формы и валидация
    const formData = await req.formData();
    const validation = BodySchema.safeParse({
      name: formData.get("name"),
      type: formData.get("type"),
      file: formData.get("file"),
    });

    if (!validation.success) {
      const first = validation.error.errors[0];
      return NextResponse.json({ error: first.message }, { status: 400 });
    }

    const { name, type, file } = validation.data;

    // 3) Буфер и имя файла
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "dat").toLowerCase();
    const safe = toSafeKebab(name) || "asset";
    const newFileName = `${safe}-${Date.now()}.${ext}`;

    // 4) Папка по типу
    let folder: "library/2d" | "library/3d" | "library/textures"; // Уточняем тип
    if (type === "3d_object") {
      folder = "library/3d";
    } else if (type === "2d_texture") {
      folder = "library/textures"; // <<< Новая папка
    } else {
      folder = "library/2d"; // Для 2d_object
    }

    // 5) Сохранение в хранилище (MinIO/S3-совместимое)
    const fileKey = await saveLibraryAsset(buffer, folder, newFileName);

    // Превью делаем для всех 2D типов, для 3D - null
    const thumbnailKey = (type === "2d_object" || type === "2d_texture") ? fileKey : null;

    // 6) Запись в БД
    await query(
      `INSERT INTO library_assets (name, type, file_key, thumbnail_key, created_by_account_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, type, fileKey, thumbnailKey, adminId]
    );

    // 7) Ответ
    return NextResponse.json({ success: true, name, type, fileKey, thumbnailKey });
  } catch (err: unknown) {
    // Не светим внутренности наружу, но в логи можно бросить err
    console.error("[library/upload] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
