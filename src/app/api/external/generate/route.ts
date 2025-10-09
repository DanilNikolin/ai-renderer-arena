import { NextRequest, NextResponse } from "next/server";
import { saveImage } from "@/lib/storage";           // adjust if you don't use "@/..."
import { LLM_SYSTEM_PROMPT } from "@/lib/constants"; // optional
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImgExt = "png" | "jpg" | "jpeg" | "webp";
type DragModel = "qwen" | "flux" | "seedream" | "gemini";

// interface ExternalJsonBody {
//   prompt: string;
//   image_url?: string;
//   model?: DragModel;
//   negative_prompt?: string;
//   seed?: number;
//   guidance_scale?: number;
//   num_inference_steps?: number;
//   safety_tolerance?: number;
//   image_size?: { width: number; height: number };
//   save_input?: boolean;
// }


interface ExternalJsonBody {
  // NEW
  description_prompt?: string;     // base description from external app
  improvement_prompt?: string;     // UI-equivalent instruction
  // Back-compat alias (treated as improvement_prompt)
  prompt?: string;

  image_url?: string;
  model?: DragModel;
  negative_prompt?: string;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  safety_tolerance?: number;
  image_size?: { width: number; height: number };
  save_input?: boolean;
}

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
    if (m) return (m[1].toLowerCase() as ImgExt);
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
async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
}
async function urlToBuffer(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch image failed: ${r.status}`);
  const ct = r.headers.get("content-type");
  const buf = Buffer.from(await r.arrayBuffer());
  const ext = inferExt(ct, url);
  return { buf, ct: ct || "image/png", ext };
}
function withCORS(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*"); // tighten if needed
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");
  return res;
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  // ---- auth ----
  const got =
    req.headers.get("x-api-key") ||
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const want = process.env.INTEGRATION_API_KEY;
  if (!want || got !== want) {
    return withCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    return withCORS(NextResponse.json({ error: "FAL_KEY missing" }, { status: 500 }));
  }

  try {
    // // Accept multipart/form-data OR JSON
    // const contentType = req.headers.get("content-type") || "";

    // // ✅ initialize with a typed default instead of `as any`
    // let bodyJSON: ExternalJsonBody = { prompt: "" };
    const contentType = req.headers.get("content-type") || "";
    let bodyJSON: ExternalJsonBody = {};

    let incomingImageAsDataUrl: string | undefined;
    let originalSavedUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      // bodyJSON.prompt = String(form.get("prompt") || "");
      bodyJSON.improvement_prompt = String(form.get("improvement_prompt") ?? form.get("prompt") ?? "").trim() || undefined;
      bodyJSON.description_prompt = String(form.get("description_prompt") ?? "").trim() || undefined;
      bodyJSON.model = (form.get("model") as DragModel | null) || undefined;
      bodyJSON.negative_prompt = (form.get("negative_prompt") as string | null) || undefined;
      bodyJSON.seed = form.get("seed") ? Number(form.get("seed")) : undefined;
      bodyJSON.guidance_scale = form.get("guidance_scale") ? Number(form.get("guidance_scale")) : undefined;
      bodyJSON.num_inference_steps = form.get("num_inference_steps") ? Number(form.get("num_inference_steps")) : undefined;
      bodyJSON.safety_tolerance = form.get("safety_tolerance") ? Number(form.get("safety_tolerance")) : undefined;
      bodyJSON.save_input = (String(form.get("save_input") || "") || "").toLowerCase() === "true";

      const file = form.get("image") as File | null;
      if (!file && !bodyJSON.prompt) {
        return withCORS(NextResponse.json({ error: "Missing image and prompt" }, { status: 400 }));
      }
      if (file) {
        incomingImageAsDataUrl = await fileToDataUrl(file);

        if (bodyJSON.save_input) {
          const buf = Buffer.from(await file.arrayBuffer());
          const ext = inferExt(file.type || "", file.name);
          const origName = `external__${tsForName()}__orig__${Math.random().toString(36).slice(2, 8)}.${ext}`;
          originalSavedUrl = await saveImage(buf, origName);
        }
      }
    } else {
      // JSON
      const parsed = (await req.json()) as ExternalJsonBody;
      bodyJSON = parsed;
      bodyJSON.improvement_prompt = (parsed.improvement_prompt ?? parsed.prompt)?.trim();
      bodyJSON.description_prompt = parsed.description_prompt?.trim();
      // if (!bodyJSON?.prompt) {
      //   return withCORS(NextResponse.json({ error: "Field 'prompt' is required" }, { status: 400 }));
      // }
      if (!bodyJSON.improvement_prompt && !bodyJSON.description_prompt) {
        return withCORS(NextResponse.json({ error: "Provide improvement_prompt (or prompt) or description_prompt" }, { status: 400 }));
      }
      if (!bodyJSON.image_url) {
        return withCORS(NextResponse.json({ error: "Provide 'image_url' or use multipart with 'image' file" }, { status: 400 }));
      }
      const r = await fetch(bodyJSON.image_url);
      if (!r.ok) {
        return withCORS(NextResponse.json({ error: `Could not fetch image_url: ${r.status}` }, { status: 400 }));
      }
      const arrayBuf = await r.arrayBuffer();
      incomingImageAsDataUrl = `data:${r.headers.get("content-type") || "image/png"};base64,${Buffer.from(arrayBuf).toString("base64")}`;

      if (bodyJSON.save_input) {
        const { buf, ext } = await urlToBuffer(bodyJSON.image_url);
        const origName = `external__${tsForName()}__orig__${Math.random().toString(36).slice(2, 8)}.${ext}`;
        originalSavedUrl = await saveImage(buf, origName);
      }
    }

    // ---- compose prompt ----
    //const internalPrefix = (process.env.EXTERNAL_PROMPT_PREFIX || "").trim();
    // const combinedPrompt = [internalPrefix, LLM_SYSTEM_PROMPT, bodyJSON.prompt]
    //   .filter(Boolean)
    //   .join("\n")
    //   .trim();
    const SYS = (process.env.EXTERNAL_PROMPT_PREFIX || LLM_SYSTEM_PROMPT || "").trim();

const finalPrompt =
  (bodyJSON.improvement_prompt && bodyJSON.improvement_prompt.length > 0)
    ? [SYS, bodyJSON.improvement_prompt].filter(Boolean).join("\n").trim()     // UI-equivalent
    : [SYS, bodyJSON.description_prompt || ""].filter(Boolean).join("\n").trim(); // only description

    // ---- FAL body ----
    const model = (bodyJSON.model || "flux").toLowerCase() as DragModel;
    //const falBody: FalRequestBody = { prompt: combinedPrompt };
    const falBody: FalRequestBody = { prompt: finalPrompt };

    if (bodyJSON.negative_prompt) falBody.negative_prompt = bodyJSON.negative_prompt;
    if (typeof bodyJSON.seed === "number") falBody.seed = bodyJSON.seed;
    if (typeof bodyJSON.guidance_scale === "number") falBody.guidance_scale = bodyJSON.guidance_scale;
    if (typeof bodyJSON.num_inference_steps === "number") falBody.num_inference_steps = bodyJSON.num_inference_steps;
    if (typeof bodyJSON.safety_tolerance === "number") falBody.safety_tolerance = bodyJSON.safety_tolerance;

    let endpointUrl: string;
    switch (model) {
      case "qwen":
      case "flux":
        endpointUrl = model === "qwen"
          ? "https://fal.run/fal-ai/qwen-image-edit"
          : "https://fal.run/fal-ai/flux-pro/kontext";
        falBody.image_url = incomingImageAsDataUrl!;
        break;
      case "gemini":
      case "seedream":
        endpointUrl = model === "gemini"
          ? "https://fal.run/fal-ai/nano-banana/edit"
          : "https://fal.run/fal-ai/bytedance/seedream/v4/edit";
        falBody.image_urls = [incomingImageAsDataUrl!];
        if (model === "seedream") {
          falBody.sync_mode = true;
          if (bodyJSON.image_size) falBody.image_size = bodyJSON.image_size;
        }
        break;
      default:
        return withCORS(NextResponse.json({ error: `Unsupported model '${model}'` }, { status: 400 }));
    }

    // ---- call FAL ----
    const falResp = await fetch(endpointUrl, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(falBody),
    });
    if (!falResp.ok) {
      const errorText = await falResp.text().catch(() => "");
      return withCORS(NextResponse.json({ error: `FAL error: ${falResp.status} ${errorText}` }, { status: falResp.status }));
    }
    const falJson = await falResp.json();
    const finalImageUrl: string | undefined =
      falJson.images?.[0]?.url || falJson.image?.url || falJson.output?.[0]?.url;
    if (!finalImageUrl) {
      return withCORS(NextResponse.json({ error: "FAL did not return an image" }, { status: 502 }));
    }

    // ---- download + store ----
    const genResp = await fetch(finalImageUrl);
    if (!genResp.ok) {
      const errText = await genResp.text().catch(() => "");
      return withCORS(NextResponse.json({ error: `Could not download image: ${genResp.status} ${errText}` }, { status: 502 }));
    }
    const ext = inferExt(genResp.headers.get("content-type"), finalImageUrl);
    const buf = Buffer.from(await genResp.arrayBuffer());

    const label = MODEL_LABELS[model] ?? model;
    const seedPart =
      typeof bodyJSON.seed === "number" && !Number.isNaN(bodyJSON.seed)
        ? `seed-${bodyJSON.seed}`
        : "seed-auto";
    const rand = Math.random().toString(36).slice(2, 8);
    const fileName = `${label}__${tsForName()}__${model}__${seedPart}__${rand}.${ext}`;
    const imageUrl = await saveImage(buf, fileName);

    return withCORS(
      NextResponse.json({
        imageUrl,
        fileName,
        model,
        sourceUrl: finalImageUrl,
        originalSavedUrl: originalSavedUrl || null,
      }),
    );
  } catch (e: unknown) {               // ✅ use unknown instead of any
    console.error(e);
    const message = e instanceof Error ? e.message : String(e);
    return withCORS(NextResponse.json({ error: message || "Internal error" }, { status: 500 }));
  }
}
