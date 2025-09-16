import { NextResponse } from "next/server";
import OpenAI from "openai";

// Если используешь типизацию сообщений с мультимодальностью:
type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image_url"; image_url: { url: string } };
type ChatMsg =
  | { role: "system"; content: string }
  | { role: "user"; content: (TextPart | ImagePart)[] }
  | { role: "assistant"; content: string };

type RefineBody = {
  prompt?: string;
  system?: string;               // системка
  model?: string;                // gpt-5-mini по умолчанию
  temperature?: number | string;
  top_p?: number | string;
  max_completion_tokens?: number | string;
  image?: string | null;         // data:image/...;base64,xxxx
};

function num(val: unknown): number | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "number") return Number.isFinite(val) ? val : undefined;
  if (typeof val === "string") {
    const t = val.trim();
    if (/^[+-]?\d+$/.test(t)) return parseInt(t, 10);
    if (/^[+-]?\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  }
  return undefined;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY не задан." },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });

    // ---- читаем JSON тело ----
    const body = (await req.json()) as RefineBody;

    const prompt = (body.prompt ?? "").trim();
    const system = (body.system ?? "").trim();
    const model = (body.model && body.model.trim()) || "gpt-5-mini";
    const temperature = num(body.temperature);
    const top_p = num(body.top_p);
    const max_completion_tokens = num(body.max_completion_tokens) ?? 200;
    const image = (body.image ?? "").trim() || null;

    if (!prompt) {
      return NextResponse.json(
        { error: "Поле 'prompt' обязательно." },
        { status: 400 }
      );
    }

    // ---- собираем мультимодальные messages ----
    const userParts: (TextPart | ImagePart)[] = [{ type: "text", text: prompt }];
    if (image) {
      // ожидаем data:URL или https URL
      userParts.push({ type: "image_url", image_url: { url: image } });
    }

    const messages: ChatMsg[] = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: userParts });

    // ---- вызов Chat Completions под GPT-5 ----
    const resp = await client.chat.completions.create({
      model,
      // @ts-expect-error — SDK принимает мультимодальные части в messages
      messages,
      max_completion_tokens,
      ...(temperature !== undefined ? { temperature } : {}),
      ...(top_p !== undefined ? { top_p } : {}),
    });

    const choice = resp.choices?.[0];
    const finishReason = choice?.finish_reason ?? "unknown";
    const refinedPrompt = choice?.message?.content?.trim() || "";

    if (refinedPrompt) {
      return NextResponse.json({
        refinedPrompt,
        finish_reason: finishReason,
        usage: resp.usage ?? null,
      });
    }

    // если пусто — лог и понятная 502
    console.error("OpenAI empty response:", JSON.stringify(resp, null, 2));
    return NextResponse.json(
      { error: `OpenAI не вернула текст. Причина завершения: '${finishReason}'.` },
      { status: 502 }
    );
  } catch (err: any) {
    console.error("refine-prompt error:", err);
    return NextResponse.json(
      { error: err?.message || "Неизвестная ошибка." },
      { status: 500 }
    );
  }
}
