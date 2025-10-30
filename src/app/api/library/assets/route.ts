// src/app/api/library/assets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { z } from "zod";

// Типы, которые мы создали в миграции
type AssetType = '2d_object' | '3d_object' | '2d_texture'; // <<< Добавлен '2d_texture'

type AssetRow = {
  id: string;
  name: string;
  type: AssetType;
  file_key: string;
  thumbnail_key: string | null;
  // Нам не нужно отдавать 'created_by_account_id' на фронт
};

const QuerySchema = z.object({
  // Добавляем новый тип сюда
  type: z.enum(['2d_object', '3d_object', '2d_texture']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Валидируем, что нам прислали в ?type=...
    const validation = QuerySchema.safeParse({
      type: searchParams.get("type") ?? undefined,
    });

    if (!validation.success) {
      // Обновляем текст ошибки
      return NextResponse.json({ error: "Invalid 'type' parameter. Must be '2d_object', '3d_object', or '2d_texture'." }, { status: 400 });
    }

    const { type } = validation.data;

    let rows: AssetRow[]; // <<< Итоговый массив строк

    // 2. Делаем запрос в базу
    if (type) {
      // <<< ФИКС: Деструктурируем { rows } из результата query()
      const { rows: queryRows } = await query<AssetRow>(
        `SELECT id, name, type, file_key, thumbnail_key
         FROM library_assets
         WHERE type = $1
         ORDER BY name ASC`,
        [type]
      );
      rows = queryRows; // <<< Присваиваем массив

    } else {
      // <<< ФИКС: Деструктурируем { rows } из результата query()
      const { rows: queryRows } = await query<AssetRow>(
        `SELECT id, name, type, file_key, thumbnail_key
         FROM library_assets
         ORDER BY type, name ASC`
      );
      rows = queryRows; // <<< Присваиваем массив
    }

    // 3. Отдаем чистый JSON
    // ВАЖНО: Мы не отдаем S3 URL. Мы отдаем "ключи".
    // Фронт сам знает, как из "library/thumbs/bucket.png" сделать
    // "http://localhost:9002/prompt-images/library/thumbs/bucket.png"
    
    const publicUrlBase = `${process.env.S3_PUBLIC_URL}/${process.env.S3_BUCKET}`;

    // <<< Теперь 'rows' — это честный массив AssetRow[], и .map() сработает
    const assets = rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      // Собираем полный URL для файла
      fileUrl: `${publicUrlBase}/${row.file_key}`,
      // И для превью (если оно есть)
      thumbnailUrl: row.thumbnail_key 
        ? `${publicUrlBase}/${row.thumbnail_key}` 
        : null, 
    }));


    return NextResponse.json(assets);

  } catch (e) {
    console.error("Failed to fetch library assets:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}