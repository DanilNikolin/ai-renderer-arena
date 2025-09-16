import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Гарантируем Node runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===== Типы и константы =====
type ImgExt = "png" | "jpg" | "jpeg" | "webp";

// Учитываем оба варианта изображения в теле запроса
interface FalRequestBody {
  prompt: string;
  image_url?: string;      // Для Qwen, Flux
  image_urls?: string[];   // Для Nano Banana (gemini)
  negative_prompt?: string;
  seed?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  safety_tolerance?: number;
}

// Папка автосейва (env > дефолт)
const SAVE_DIR =
  process.env.IMAGES_SAVE_PATH ||
  "D:\\Work\\images from Image test for 3Dims (3 models)";

// Метки для префикса файлов
const MODEL_LABELS: Record<string, string> = {
  qwen: "qwen",
  flux: "flux",
  gemini: "Nano-Banana",
};

// ===== Вспомогалки =====
function inferExt(contentType?: string | null, url?: string): ImgExt {
  if (contentType) {
    const ct = contentType.toLowerCase();
    if (ct.includes("png")) return "png";
    if (ct.includes("jpeg")) return "jpeg";
    if (ct.includes("jpg")) return "jpg";
    if (ct.includes("webp")) return "webp";
  }
  if (url) {
    const m = url.toLowerCase().match(/\.(png|jpe?g|webp)(\?|#|$)/i);
    if (m) return (m[1].toLowerCase() as ImgExt).replace("jpeg", "jpeg") as ImgExt;
  }
  return "png";
}

function tsForName(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}__${hh}-${mi}-${ss}`;
}


// Возвращает следующий индекс для файлов с префиксом <label><N>
async function getNextLabelIndex(dir: string, label: string): Promise<number> {
  try {
    const files = await fs.readdir(dir).catch(() => []);
    let max = 0;
    // Ищем ровно в начале имени: label + число (например, "нано-банано12__...")
    const re = new RegExp(`^${label.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(\\d+)\\b`, "i");
    for (const name of files) {
      const m = name.match(re);
      if (m) {
        const n = Number(m[1]);
        if (!Number.isNaN(n) && n > max) max = n;
      }
    }
    return max + 1;
  } catch {
    return 1;
  }
}

export async function POST(req: NextRequest) {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    return NextResponse.json({ error: "Ключ API для fal.ai не найден" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const model = (formData.get("model") as string | null)?.toLowerCase() || null;
    const prompt = formData.get("prompt") as string | null;
    const negativePrompt = formData.get("negative_prompt") as string | null;
    const imageFile = formData.get("image") as File | null;
    const settingsStr = formData.get("settings") as string | null;

    if (!model || !prompt || !imageFile) {
      return NextResponse.json({ error: "Отсутствуют обязательные поля" }, { status: 400 });
    }

    // Подготовка входного изображения как data URL
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imageUrl = `data:${imageFile.type};base64,${imageBuffer.toString("base64")}`;

    // Парсим настройки
    const settings = settingsStr ? JSON.parse(settingsStr) : {};

    // Базовое тело запроса
    const body: FalRequestBody = { prompt };
    if (negativePrompt) body.negative_prompt = negativePrompt;

    // Маршрут и особые поля под конкретную модель
    let endpointUrl: string;
    switch (model) {
      case "qwen":
        endpointUrl = "https://fal.run/fal-ai/qwen-image-edit";
        body.image_url = imageUrl;
        if (settings.guidance_scale != null) body.guidance_scale = settings.guidance_scale;
        if (settings.num_inference_steps != null) body.num_inference_steps = settings.num_inference_steps;
        if (settings.seed != null) body.seed = settings.seed;
        break;

      case "flux":
        endpointUrl = "https://fal.run/fal-ai/flux-pro/kontext";
        body.image_url = imageUrl;
        if (settings.guidance_scale != null) body.guidance_scale = settings.guidance_scale;
        if (settings.safety_tolerance != null) body.safety_tolerance = settings.safety_tolerance;
        if (settings.seed != null) body.seed = settings.seed;
        break;

      case "gemini": // Nano Banana edit
        endpointUrl = "https://fal.run/fal-ai/nano-banana/edit";
        body.image_urls = [imageUrl];
        if (settings.seed != null) body.seed = settings.seed;
        break;

      default:
        return NextResponse.json({ error: `Модель '${model}' не поддерживается` }, { status: 400 });
    }

    // Вызов FAL
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      return NextResponse.json({ error: `Ошибка API: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();

    // Унификация ответа: ищем URL итоговой картинки
    const finalImageUrl: string | undefined =
      data.images?.[0]?.url || data.image?.url || data.output?.[0]?.url;

    if (!finalImageUrl) {
      console.error("API did not return an image URL. Response:", data);
      return NextResponse.json({ error: "API не вернуло изображение" }, { status: 500 });
    }

    // Скачиваем итоговое изображение
    const imgResp = await fetch(finalImageUrl);
    if (!imgResp.ok) {
      const errText = await imgResp.text().catch(() => "");
      return NextResponse.json(
        { error: `Не удалось скачать изображение: ${imgResp.status} ${errText}` },
        { status: 502 }
      );
    }

    const ct = imgResp.headers.get("content-type");
    const ext = inferExt(ct, finalImageUrl);
    const buf = Buffer.from(await imgResp.arrayBuffer());

    // Префикс с меткой модели и авто-индексом: "<label><N>__..."
    const label = MODEL_LABELS[model] ?? model;
    await fs.mkdir(SAVE_DIR, { recursive: true });
    const labelIndex = await getNextLabelIndex(SAVE_DIR, label);

    // Хвост имени как у тебя раньше
    const seedPart =
      typeof settings?.seed === "number" && !Number.isNaN(settings.seed)
        ? `seed-${settings.seed}`
        : "seed-auto";

    // Итоговое имя: "<label><N>__<timestamp>__<model>__<seedPart>.<ext>"
    const fileName = `${label}${labelIndex}__${tsForName()}__${model}__${seedPart}.${ext}`;

    // Пишем файл
    const filePath = path.join(SAVE_DIR, fileName);
    await fs.writeFile(filePath, buf);

    // Ответ
    return NextResponse.json({
      imageUrl: finalImageUrl,
      savedPath: filePath,
      fileName,
      label,
      labelIndex,
    });
  } catch (e: any) {
    console.error("Server-side error:", e);
    return NextResponse.json(
      { error: e?.message || "Неизвестная ошибка на сервере" },
      { status: 500 }
    );
  }
}
