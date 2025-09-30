// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Гарантируем Node runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===== Типы и константы =====
type ImgExt = "png" | "jpg" | "jpeg" | "webp";

interface FalRequestBody {
  prompt: string;
  image_url?: string;
  image_urls?: string[]; // <<< Теперь это массив для мульти-аплоада
  negative_prompt?: string;
  seed?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  safety_tolerance?: number;
  sync_mode?: boolean;
  image_size?: { width: number, height: number };
}

const SAVE_DIR =
  process.env.IMAGES_SAVE_PATH ||
  "D:\\Work\\images from Image test for 3Dims (3 models)";

const MODEL_LABELS: Record<string, string> = {
  qwen: "qwen",
  flux: "flux",
  seedream: "sdream",
  gemini: "Nano-Banana",
};

// ===== Вспомогалки =====

// <<< НОВАЯ ВСПОМОГАЛКА для конвертации File в data URL
async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

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

async function getNextLabelIndex(dir: string, label: string): Promise<number> {
  try {
    const files = await fs.readdir(dir).catch(() => []);
    let max = 0;
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

    // <<< НАЧАЛО ИЗМЕНЕНИЙ: Получаем второй, опциональный файл
    const referenceImageFile = formData.get("reference_image") as File | null;
    // КОНЕЦ ИЗМЕНЕНИЙ

    if (!model || !prompt || !imageFile) {
      return NextResponse.json({ error: "Отсутствуют обязательные поля" }, { status: 400 });
    }
    
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    const body: FalRequestBody = { prompt };
    if (negativePrompt) body.negative_prompt = negativePrompt;

    let endpointUrl: string;
    switch (model) {
      case "qwen":
      case "flux": // <<< ОБЪЕДИНЯЕМ ЛОГИКУ ДЛЯ ОДИНОЧНЫХ МОДЕЛЕЙ
        endpointUrl = model === 'qwen' 
          ? "https://fal.run/fal-ai/qwen-image-edit" 
          : "https://fal.run/fal-ai/flux-pro/kontext";
        
        body.image_url = await fileToDataUrl(imageFile);
        
        if (settings.guidance_scale != null) body.guidance_scale = settings.guidance_scale;
        if (model === 'qwen' && settings.num_inference_steps != null) body.num_inference_steps = settings.num_inference_steps;
        if (model === 'flux' && settings.safety_tolerance != null) body.safety_tolerance = settings.safety_tolerance;
        if (settings.seed != null) body.seed = settings.seed;
        break;

      case "gemini": // Nano Banana
      case "seedream": // <<< ОБЪЕДИНЯЕМ ЛОГИКУ ДЛЯ МУЛЬТИ-МОДЕЛЕЙ
        endpointUrl = model === 'gemini' 
          ? "https://fal.run/fal-ai/nano-banana/edit"
          : "https://fal.run/fal-ai/bytedance/seedream/v4/edit";
          
        const imageUrls = [await fileToDataUrl(imageFile)];
        // Если есть референс, добавляем его вторым
        if (referenceImageFile) {
          imageUrls.push(await fileToDataUrl(referenceImageFile));
        }
        body.image_urls = imageUrls;
        
        if (model === 'seedream') {
          body.sync_mode = true;
          if (settings.width != null && settings.height != null) {
            body.image_size = { width: settings.width, height: settings.height };
          }
        }
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
    const finalImageUrl: string | undefined =
      data.images?.[0]?.url || data.image?.url || data.output?.[0]?.url;

    if (!finalImageUrl) {
      console.error("API did not return an image URL. Response:", data);
      return NextResponse.json({ error: "API не вернуло изображение" }, { status: 500 });
    }
    
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
    
    const label = MODEL_LABELS[model] ?? model;
    await fs.mkdir(SAVE_DIR, { recursive: true });
    const labelIndex = await getNextLabelIndex(SAVE_DIR, label);
    
    const seedPart =
      typeof settings?.seed === "number" && !Number.isNaN(settings.seed)
        ? `seed-${settings.seed}`
        : "seed-auto";
        
    const fileName = `${label}${labelIndex}__${tsForName()}__${model}__${seedPart}.${ext}`;
    const filePath = path.join(SAVE_DIR, fileName);
    await fs.writeFile(filePath, buf);
    
    return NextResponse.json({
      imageUrl: finalImageUrl,
      savedPath: filePath,
      fileName,
      label,
      labelIndex,
    });
  } catch (e: unknown) {
    console.error("Server-side error:", e);
    const message = e instanceof Error ? e.message : "Неизвестная ошибка на сервере";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}