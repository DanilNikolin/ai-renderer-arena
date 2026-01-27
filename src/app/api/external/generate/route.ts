// src/app/api/external/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionContentPart,
} from "openai/resources/chat/completions";
import crypto from "crypto";
import { query } from "@/lib/db";
import { saveImage } from "@/lib/storage";
import { LLM_SYSTEM_PROMPT } from "@/lib/constants";
import { getImageSizeFromBuffer } from "@/lib/image.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------------- Types ---------------- */

type ImgExt = "png" | "jpg" | "jpeg" | "webp";
type DragModel = "qwen" | "flux" | "seedream" | "gemini";

interface ExternalJsonBody {
  // text variants (UI/external may send any of these)
  prompt?: string;
  description_prompt?: string;
  improvement_prompt?: string;

  image_url?: string;
  model?: DragModel;
  negative_prompt?: string;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  safety_tolerance?: number;
  image_size?: { width: number; height: number };
  save_input?: boolean;

  // optional view hints (used in GPT template composition)
  windowView?: string;
  doorView?: string;
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
  acceleration?: string;
}

interface QueryResult<T = unknown> {
  rows: T[];
}

const MODEL_LABELS: Record<string, string> = {
  qwen: "qwen",
  flux: "flux",
  seedream: "sdream",
  gemini: "Nano-Banana",
};

/* ---------------- Helpers ---------------- */

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
    if (m) return m[1].toLowerCase() as ImgExt;
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

function withCORS(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Api-Key, Authorization",
  );
  return res;
}

function sanitizeInput(s: string, max = 2000): string {
  // collapse whitespace, strip control chars, hard cap length
  const cleaned = s
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, max);
}

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type || "application/octet-stream"};base64,${buffer.toString(
    "base64",
  )}`;
}

async function urlToBuffer(url: string, timeoutMs = 15000) {
  const { body, ct } = await fetchWithTimeout(url, {}, timeoutMs);
  const buf = Buffer.from(await body.arrayBuffer());
  const ext = inferExt(ct, url);
  return { buf, ct, ext };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ body: Response; ct: string | null }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    return { body: res, ct: res.headers.get("content-type") };
  } finally {
    clearTimeout(t);
  }
}

function randSeed(): number {
  // 31-bit positive integer
  return Math.floor(Math.random() * 0x7fffffff);
}

function hasRows(obj: unknown): obj is { rows: unknown[] } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Array.isArray((obj as { rows?: unknown[] }).rows)
  );
}

function isRowArrayWithId(x: unknown): x is Array<{ id: string }> {
  return (
    Array.isArray(x) &&
    x.length > 0 &&
    typeof (x[0] as { id?: unknown }).id === "string"
  );
}

function extractReturningId(result: unknown): string | null {
  // Case 1: driver returns { rows: [...] }
  if (hasRows(result) && isRowArrayWithId(result.rows)) {
    return result.rows[0].id;
  }
  // Case 2: driver returns bare array [...]
  if (isRowArrayWithId(result)) {
    return result[0].id;
  }
  return null;
}


/* ---------------- OPTIONS ---------------- */

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }));
}

/* ---------------- Handler ---------------- */

export async function POST(req: NextRequest) {
  const t0 = Date.now();

  // ---- simple API key guard ----
  const got =
    req.headers.get("x-api-key") ||
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const want = process.env.INTEGRATION_API_KEY;
  if (!want || got !== want) {
    return withCORS(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
  }

  const presentedKey = got!.trim();
  const apiKeyHash = crypto
    .createHash("sha256")
    .update(presentedKey)
    .digest("hex");
  const apiKeyLabel = process.env.INTEGRATION_API_LABEL || null; // optional, human-readable
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") || null;

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    return withCORS(
      NextResponse.json({ error: "FAL_KEY missing" }, { status: 500 }),
    );
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return withCORS(
      NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 }),
    );
  }

  let auditId: string | null = null;

  // ⬇⬇⬇ NEW: set a size of the original image 
  let sourceImageSize: { width: number; height: number } | undefined;

  try {
    const contentType = req.headers.get("content-type") || "";
    let bodyJSON: ExternalJsonBody = {};
    let imageUrl: string | undefined;
    let originalSavedUrl: string | undefined;
    let incomingImageAsDataUrl: string | undefined;

    // Defaults for optional hints (window/door view)
    let windowView = "Green summer forest, photorealism, high detail|snow-covered winter forest, photorealism, high detail|a majestic view of the snow-capped Alpine mountains under a clear blue sky,photorealism, high detail|a neat suburban backyard in summer with a manicured green lawn and a wooden fence,photorealism, high detail|a suburban backyard in winter, covered in a fresh blanket of snow,photorealism, high detail|the lake, photorealism, high detail";
    let doorView = "cozy entrance hall (changing room) with bath towels";

    /* ---------- A) multipart/form-data (image file upload) ---------- */
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      const desc = sanitizeInput(
        String(form.get("description_prompt") ?? ""),
      );
      const improve = sanitizeInput(
        String(form.get("improvement_prompt") ?? ""),
      );
      const prompt = sanitizeInput(String(form.get("prompt") ?? ""));

      bodyJSON.description_prompt = desc || undefined;
      bodyJSON.improvement_prompt = improve || undefined;
      bodyJSON.prompt = prompt || undefined;

      bodyJSON.model = (form.get("model") as DragModel | null) || "qwen";
      // bodyJSON.negative_prompt = (form.get("negative_prompt") as string | null) || undefined;
      bodyJSON.negative_prompt =
        (form.get("negative_prompt") as string | null) ||
        "blurry, ugly, deformed, text, watermark, toilet, toilet bowl, urinal";
      bodyJSON.seed = form.get("seed") ? Number(form.get("seed")) : undefined;
      bodyJSON.guidance_scale = form.get("guidance_scale")
        ? Number(form.get("guidance_scale"))
        : undefined;
      bodyJSON.num_inference_steps = form.get("num_inference_steps")
        ? Number(form.get("num_inference_steps"))
        : undefined;
      bodyJSON.safety_tolerance = form.get("safety_tolerance")
        ? Number(form.get("safety_tolerance"))
        : undefined;
      bodyJSON.image_size = ((): ExternalJsonBody["image_size"] => {
        const w = form.get("width");
        const h = form.get("height");
        if (w && h) return { width: Number(w), height: Number(h) };
        return undefined;
      })();
      bodyJSON.save_input =
        (String(form.get("save_input") || "") || "")
          .toLowerCase()
          .trim() === "true";

      windowView = sanitizeInput(
        String(form.get("windowView") ?? windowView),
      );
      doorView = sanitizeInput(String(form.get("doorView") ?? doorView));

      const file = form.get("image") as File | null;
      if (
        !bodyJSON.description_prompt &&
        !bodyJSON.improvement_prompt &&
        !bodyJSON.prompt
      ) {
        return withCORS(
          NextResponse.json(
            { error: "Missing 'description_prompt' or 'prompt'." },
            { status: 400 },
          ),
        );
      }
      if (!file) {
        return withCORS(
          NextResponse.json(
            { error: "Missing 'image' file" },
            { status: 400 },
          ),
        );
      }

      // Validate file type by MIME + filename
      const mime = (file.type || "").toLowerCase();
      const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowed.includes(mime)) {
        return withCORS(
          NextResponse.json(
            { error: `Unsupported image type: ${mime || "unknown"}` },
            { status: 415 },
          ),
        );
      }

      // build data URL we pass downstream
      incomingImageAsDataUrl = await fileToDataUrl(file);

      // ⬇⬇⬇ NEW:  we determine/figure out the actual size of the source image
      const uploadBuf = Buffer.from(await file.arrayBuffer());
      const detectedSize = await getImageSizeFromBuffer(uploadBuf);

      // saving the origina, if needs
      if (bodyJSON.save_input) {
        const ext = inferExt(file.type || "", (file as File & { name?: string }).name);
        const origName = `external__${tsForName()}__orig__${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        originalSavedUrl = await saveImage(uploadBuf, origName);
      }


      // Priority: If the user has submitted width/height, respect them.
      // Otherwise, fallback to detectedSize.
      if (bodyJSON.image_size) {
        sourceImageSize = bodyJSON.image_size;
      } else if (detectedSize) {
        sourceImageSize = {
          width: detectedSize.width,
          height: detectedSize.height,
        };
      }

      // No public URL supplied in multipart; imageUrl remains undefined
      imageUrl = undefined;
    }
    /* ---------- B) application/json (remote image_url) ---------- */
    else {
      bodyJSON = (await req.json()) as ExternalJsonBody;

      const model = (bodyJSON.model || "qwen").toLowerCase() as DragModel;
      bodyJSON.model = model;

      imageUrl = bodyJSON.image_url?.trim();
      if (!imageUrl) {
        return withCORS(
          NextResponse.json(
            { error: "Field 'image_url' is required" },
            { status: 400 },
          ),
        );
      }

      const haveText = (
        bodyJSON.improvement_prompt ??
        bodyJSON.prompt ??
        bodyJSON.description_prompt ??
        ""
      )
        .trim()
        .length > 0;
      if (!haveText) {
        return withCORS(
          NextResponse.json(
            {
              error:
                "Field 'prompt' (or description/improvement) is required",
            },
            { status: 400 },
          ),
        );
      }

      if (typeof bodyJSON.save_input !== "boolean") {
        bodyJSON.save_input = Boolean(bodyJSON.save_input);
      }

      windowView = sanitizeInput(bodyJSON.windowView ?? windowView);
      doorView = sanitizeInput(bodyJSON.doorView ?? doorView);

      // Fetch the remote image with timeout so we can also save the original if requested
      const r = await fetchWithTimeout(imageUrl, {}, 15000);
      if (!r.body.ok) {
        return withCORS(
          NextResponse.json(
            { error: `Fetch image_url failed: ${r.body.status}` },
            { status: 400 },
          ),
        );
      }

      const arrayBuf = await r.body.arrayBuffer();
      const remoteBuf = Buffer.from(arrayBuf);

      incomingImageAsDataUrl = `data:${r.ct || "image/png"};base64,${remoteBuf.toString(
        "base64",
      )}`;

      if (bodyJSON.save_input) {
        const { buf, ext } = await urlToBuffer(imageUrl, 15000);
        const origName = `external__${tsForName()}__orig__${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        originalSavedUrl = await saveImage(buf, origName);
      }

      // ⬇⬇⬇ NEW: determinate the new size by sharp
      const detectedSize = await getImageSizeFromBuffer(remoteBuf);

      if (bodyJSON.image_size) {
        sourceImageSize = bodyJSON.image_size;
      } else if (detectedSize) {
        sourceImageSize = {
          width: detectedSize.width,
          height: detectedSize.height,
        };
      }
    }

    // ---- enforce our defaults (guidance=4, steps=30, seed=random) ----
    const effGuidance =
      typeof bodyJSON.guidance_scale === "number" &&
        Number.isFinite(bodyJSON.guidance_scale)
        ? bodyJSON.guidance_scale
        : 4;

    const effSteps =
      typeof bodyJSON.num_inference_steps === "number" &&
        Number.isFinite(bodyJSON.num_inference_steps)
        ? bodyJSON.num_inference_steps
        : 30;

    const effSeed =
      typeof bodyJSON.seed === "number" && Number.isFinite(bodyJSON.seed)
        ? bodyJSON.seed
        : randSeed();

    // Compose the text we’ll send to GPT
    const userText = (
      bodyJSON.improvement_prompt ??
      bodyJSON.prompt ??
      bodyJSON.description_prompt ??
      ""
    ).trim();

    // 'windowView' variable already holds the default list or user input
    let selectedWindowView = windowView;
    if (windowView.includes('|')) {
      const options = windowView.split('|').filter(s => s.trim().length > 0);
      selectedWindowView = options[Math.floor(Math.random() * options.length)].trim();
    }
    // Now use the single selected view
    const augmentedText = `${userText}\n[VIEW_WINDOW: ${selectedWindowView}]\n[VIEW_DOOR: ${doorView}]`;

    // Seed audit row (processing)
    const modelEff = (bodyJSON.model || "qwen").toLowerCase();
    const promptRaw = userText;
    const imgInputUrl = imageUrl || null;

    try {
      const insertRes = await query(
        `INSERT INTO external_request_audit
          (api_key_hash, api_key_label, client_ip, user_agent,
          model, guidance_scale, num_steps, seed_used,
          prompt_raw, window_view, door_view, image_input_url, original_saved_url, negative_prompt,
          status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'processing')
        RETURNING id`,
        [
          apiKeyHash,
          apiKeyLabel,
          clientIp,
          userAgent,
          modelEff,
          effGuidance,
          effSteps,
          effSeed,
          promptRaw,
          windowView,
          doorView,
          imgInputUrl,
          originalSavedUrl || null,
          bodyJSON.negative_prompt || null,
        ]
      );
      auditId = extractReturningId(insertRes);
      // Если дошли сюда - пишем в лог, что всё ОК
      console.log(`[external/generate] Audit insert OK, id: ${auditId}`);
    } catch (auditError: unknown) { // <<< ТЕПЕРЬ ЛОВИМ И ЛОГГИРУЕМ
      console.error("[external/generate] FAILED TO INSERT AUDIT RECORD:", auditError);
      // ignore audit insert failure, но теперь мы видим причину в логах
    }

    // ---- Step 1: ask GPT to produce the template prompt ----
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });

    const userParts: ChatCompletionContentPart[] = [
      { type: "text", text: augmentedText },
    ];

    // Give GPT the image context—either data URL (multipart) or remote URL (JSON)
    if (incomingImageAsDataUrl) {
      userParts.push({
        type: "image_url",
        image_url: { url: incomingImageAsDataUrl },
      });
    } else if (imageUrl) {
      userParts.push({ type: "image_url", image_url: { url: imageUrl } });
    }

    const gptMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: (LLM_SYSTEM_PROMPT || "").trim() },
      { role: "user", content: userParts },
    ];

    const gptResp = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: gptMessages,
      max_completion_tokens: 6000, // min 2000, 4000 is enough.
      temperature: 1.0,
      top_p: 1,
    });

    const refinedTemplate =
      gptResp.choices?.[0]?.message?.content?.trim() || userText;

    if (auditId) {
      await query(
        `UPDATE external_request_audit SET gpt_template = $1 WHERE id = $2`,
        [refinedTemplate, auditId],
      ).catch(() => { });
    }

    // ---- Step 2: call FAL using GPT output as prompt ----
    const model = (bodyJSON.model || "qwen").toLowerCase() as DragModel;
    const falBody: FalRequestBody = { prompt: refinedTemplate };
    const negative_prompt = bodyJSON.negative_prompt;

    let endpointUrl: string;
    switch (model) {
      case "qwen": {
        endpointUrl = "https://fal.run/fal-ai/qwen-image-edit";
        falBody.image_url = incomingImageAsDataUrl || imageUrl!;
        falBody.guidance_scale = effGuidance;
        falBody.seed = effSeed;
        falBody.num_inference_steps = effSteps;
        falBody.acceleration = "regular";

        // ⬇⬇⬇ NEW: We strictly push the original size so that the model doesn't rescale to 1440px
        if (sourceImageSize?.width && sourceImageSize?.height) {
          falBody.image_size = {
            width: sourceImageSize.width,
            height: sourceImageSize.height,
          };
        }
        break;
      }
      case "flux": {
        endpointUrl = "https://fal.run/fal-ai/flux-2-pro/edit";
        const img = incomingImageAsDataUrl || imageUrl!;
        falBody.image_urls = [img];
        falBody.guidance_scale = effGuidance;
        falBody.seed = effSeed;
        // Flux 2 pro usually doesn't expose strict steps or acceleration the same way, or uses defaults.
        // We'll pass safety_tolerance if present.
        if (typeof bodyJSON.safety_tolerance === "number") {
          falBody.safety_tolerance = bodyJSON.safety_tolerance;
        }
        break;
      }
      case "gemini":
      case "seedream": {
        endpointUrl =
          model === "gemini"
            ? "https://fal.run/fal-ai/nano-banana-pro/edit"
            : "https://fal.run/fal-ai/bytedance/seedream/v4.5/edit";

        const img = incomingImageAsDataUrl || imageUrl!;
        falBody.image_urls = [img];
        // enforce seed default (these accept seed)
        falBody.seed = effSeed;
        if (model === "seedream") {
          falBody.sync_mode = true;
          if (bodyJSON.image_size) falBody.image_size = bodyJSON.image_size;
        }
        break;
      }
      default:
        return withCORS(
          NextResponse.json(
            { error: `Unsupported model '${model}'` },
            { status: 400 },
          ),
        );
    }

    if (negative_prompt) falBody.negative_prompt = negative_prompt;

    if (auditId) {
      await query(
        `UPDATE external_request_audit SET fal_endpoint = $1 WHERE id = $2`,
        [endpointUrl, auditId],
      ).catch(() => { });
    }

    // FAL call with timeout, too
    const falReq = await fetchWithTimeout(
      endpointUrl,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(falBody),
      },
      30000,
    );

    if (!falReq.body.ok) {
      const errorText = await falReq.body.text().catch(() => "");
      if (auditId) {
        await query(
          `UPDATE external_request_audit
             SET status='failed', error_message = $1
           WHERE id=$2`,
          [
            `FAL error: ${falReq.body.status} ${errorText}`.slice(0, 2000),
            auditId,
          ],
        ).catch(() => { });
      }
      return withCORS(
        NextResponse.json(
          {
            error: `FAL error: ${falReq.body.status} ${errorText}`,
          },
          { status: falReq.body.status },
        ),
      );
    }

    const falJson = await falReq.body.json();
    const finalImageUrl: string | undefined =
      falJson.images?.[0]?.url ||
      falJson.image?.url ||
      falJson.output?.[0]?.url;
    if (!finalImageUrl) {
      if (auditId) {
        await query(
          `UPDATE external_request_audit
             SET status='failed', error_message = 'FAL did not return an image'
           WHERE id=$1`,
          [auditId],
        ).catch(() => { });
      }
      return withCORS(
        NextResponse.json(
          { error: "FAL did not return an image" },
          { status: 502 },
        ),
      );
    }

    // ---- download result + store to MinIO ----
    const genReq = await fetchWithTimeout(finalImageUrl, {}, 20000);
    if (!genReq.body.ok) {
      const errText = await genReq.body.text().catch(() => "");
      if (auditId) {
        await query(
          `UPDATE external_request_audit
             SET status='failed', error_message = $1
           WHERE id=$2`,
          [
            `Could not download image: ${genReq.body.status} ${errText}`.slice(
              0,
              2000,
            ),
            auditId,
          ],
        ).catch(() => { });
      }
      return withCORS(
        NextResponse.json(
          {
            error: `Could not download image: ${genReq.body.status} ${errText}`,
          },
          { status: 502 },
        ),
      );
    }
    const ct = genReq.ct;
    const ext = inferExt(ct, finalImageUrl);
    const buf = Buffer.from(await genReq.body.arrayBuffer());

    const label = MODEL_LABELS[model] ?? model;
    const seedPart = Number.isFinite(effSeed)
      ? `seed-${effSeed}`
      : "seed-auto";
    const rand = Math.random().toString(36).slice(2, 8);
    const fileName = `${label}__${tsForName()}__${model}__${seedPart}__${rand}.${ext}`;

    const imageUrlStored = await saveImage(buf, fileName);

    if (auditId) {
      await query(
        `UPDATE external_request_audit
           SET fal_response_url = $1,
               stored_image_url = $2,
               status = 'ok'
         WHERE id = $3`,
        [finalImageUrl, imageUrlStored, auditId],
      ).catch(() => { });
    }

    const durationMs = Date.now() - t0;

    return withCORS(
      NextResponse.json({
        imageUrl: imageUrlStored, // public URL via Nginx /images/*
        model,
        template: refinedTemplate, // GPT template used for generation
        sourceUrl: finalImageUrl, // FAL CDN url we downloaded from
        originalSavedUrl: originalSavedUrl || null,
        durationMs,
      }),
    );
  } catch (e: unknown) {
    const msg =
      e instanceof Error
        ? e.message
        : (() => {
          try {
            return JSON.stringify(e);
          } catch {
            return String(e);
          }
        })();

    if (auditId) {
      await query(
        `UPDATE external_request_audit
           SET status='failed',
               error_message = COALESCE(error_message,'') || CASE
                 WHEN COALESCE(error_message,'') = '' THEN $1
                 ELSE E'\n' || $1
               END
         WHERE id=$2`,
        [String(msg).slice(0, 2000), auditId],
      ).catch(() => { });
    }

    console.error("external/generate error:", e);
    return withCORS(
      NextResponse.json({ error: msg || "Internal error" }, { status: 500 }),
    );
  }
}