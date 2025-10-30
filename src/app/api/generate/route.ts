// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveImage } from "../../../lib/storage"; // keep relative import
import { getImageSizeFromBuffer } from "@/lib/image.server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- types ----
type ImgExt = "png" | "jpg" | "jpeg" | "webp";
interface FalRequestBody {
  prompt: string;
  image_url?: string;
  image_urls?: string[];
  negative_prompt?: string;
  seed?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  safety_tolerance?: number;
  sync_mode?: boolean;
  image_size?: { width: number; height: number };
}

const MODEL_LABELS: Record<string, string> = {
  qwen: "qwen",
  flux: "flux",
  seedream: "sdream",
  gemini: "Nano-Banana",
};

// ---- helpers ----
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

// ---- handler ----
export async function POST(req: NextRequest) {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return NextResponse.json({ error: "FAL_KEY missing" }, { status: 500 });

  try {
    const formData = await req.formData();
    const model = (formData.get("model") as string | null)?.toLowerCase() || null;
    const prompt = formData.get("prompt") as string | null;
    const negativePrompt = formData.get("negative_prompt") as string | null;
    const imageFile = formData.get("image") as File | null;
    const settingsStr = formData.get("settings") as string | null;
    const referenceImageFile = formData.get("reference_image") as File | null;

    if (!model || !prompt || !imageFile) {
      return NextResponse.json({ error: "Отсутствуют обязательные поля" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const detectedSize = await getImageSizeFromBuffer(imageBuffer);

    if (!detectedSize) {
        return NextResponse.json({ error: "Не удалось прочитать размеры изображения" }, { status: 400 });
    }

    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    const body: FalRequestBody = { prompt };
    if (negativePrompt) body.negative_prompt = negativePrompt;

    let endpointUrl: string;
    switch (model) {
      case "qwen":
      case "flux":
        endpointUrl = model === "qwen"
          ? "https://fal.run/fal-ai/qwen-image-edit"
          : "https://fal.run/fal-ai/flux-pro/kontext";
        body.image_url = await fileToDataUrl(imageFile);
        if (settings.guidance_scale != null) body.guidance_scale = settings.guidance_scale;
        if (model === "qwen") {
          if (settings.num_inference_steps != null) body.num_inference_steps = settings.num_inference_steps;
          // Жестко прокидываем размер, чтобы Qwen не ресайзил
          body.image_size = {
              width: detectedSize.width,
              height: detectedSize.height,
          };
        }
       

        if (model === "flux" && settings.safety_tolerance != null) body.safety_tolerance = settings.safety_tolerance;
        if (settings.seed != null) body.seed = settings.seed;
        break;

      case "gemini":
      case "seedream":
        endpointUrl = model === "gemini"
          ? "https://fal.run/fal-ai/nano-banana/edit"
          : "https://fal.run/fal-ai/bytedance/seedream/v4/edit";
        const imageUrls = [await fileToDataUrl(imageFile)];
        if (referenceImageFile) imageUrls.push(await fileToDataUrl(referenceImageFile));
        body.image_urls = imageUrls;
        if (model === "seedream") {
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

    // call fal
    const falResp = await fetch(endpointUrl, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!falResp.ok) {
      const errorText = await falResp.text().catch(() => "");
      return NextResponse.json({ error: `Ошибка API: ${falResp.status} ${errorText}` }, { status: falResp.status });
    }

    const data = await falResp.json();
    const finalImageUrl: string | undefined =
      data.images?.[0]?.url || data.image?.url || data.output?.[0]?.url;
    if (!finalImageUrl) {
      return NextResponse.json({ error: "API не вернуло изображение" }, { status: 500 });
    }

    // download generated image
    const imgResp = await fetch(finalImageUrl);
    if (!imgResp.ok) {
      const errText = await imgResp.text().catch(() => "");
      return NextResponse.json({ error: `Не удалось скачать изображение: ${imgResp.status} ${errText}` }, { status: 502 });
    }
    const ct = imgResp.headers.get("content-type");
    const ext = inferExt(ct, finalImageUrl);
    const buf = Buffer.from(await imgResp.arrayBuffer());

    // build filename (no filesystem scan needed)
    const label = MODEL_LABELS[model] ?? model;
    const seedPart = typeof settings?.seed === "number" && !Number.isNaN(settings.seed) ? `seed-${settings.seed}` : "seed-auto";
    const rand = Math.random().toString(36).slice(2, 8);
    const labelIndex = 1; // kept for compatibility in the name
    const fileName = `${label}${labelIndex}__${tsForName()}__${model}__${seedPart}__${rand}.${ext}`;

    // store to MinIO and get URL (stable /images/* if S3_PUBLIC_PROXY_BASE=/images)
    const imageUrl = await saveImage(buf, fileName);

    return NextResponse.json({ imageUrl, sourceUrl: finalImageUrl, fileName, label, labelIndex });
  } catch (e: unknown) {
    const msg =
      e instanceof Error
        ? e.message
        : (() => {
            try { return JSON.stringify(e); } catch { return String(e); }
          })();
  
    // log stack when available
    if (e instanceof Error && e.stack) {
      console.error("Server-side error:", e.stack);
    } else {
      console.error("Server-side error:", msg);
    }
  
    return NextResponse.json({ error: msg || "Internal error" }, { status: 500 });
  }
}
