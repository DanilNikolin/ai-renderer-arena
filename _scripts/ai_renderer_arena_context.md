# Контекст проекта: ai-renderer-arena

## Структура проекта

```
ai-renderer-arena
├── .gitignore
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── generate
│   │   │   │   └── route.ts
│   │   │   └── refine-prompt
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── ImageWorkspace.tsx
│   │   ├── ui
│   │   │   └── FormControls.tsx
│   │   └── workspace
│   │       ├── Canvas.tsx
│   │       └── Sidebar.tsx
│   ├── hooks
│   │   └── useImageWorkspace.ts
│   └── lib
│       ├── types.ts
│       └── utils.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Файл: `.gitignore`

```plaintext
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

---

## Файл: `eslint.config.mjs`

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;

```

---

## Файл: `next-env.d.ts`

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

---

## Файл: `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

---

## Файл: `package.json`

```json
{
  "name": "ai-renderer-arena",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@fal-ai/client": "^1.6.2",
    "gpt-tokenizer": "^3.0.1",
    "next": "^15.5.3",
    "openai": "^5.20.3",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.5.3",
    "postcss": "^8.5.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

```

---

## Файл: `postcss.config.mjs`

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

---

## Файл: `README.md`

```markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

---

## Файл: `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // ✨ Добавим сюда наши кастомные цвета из твоего кода, чтобы все было в одном месте
      colors: {
        'gray-850': '#1b2332',
        'block-muted': '#483853',
      },
    },
  },
  plugins: [],
};
export default config;
```

---

## Файл: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

---

## Файл: `src/app/globals.css`

```css

/*D:\Work\Image test for 3Dims (3 models)\ai-renderer-arena\src\app\globals.css*/
@import "tailwindcss";
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-block-muted: #4f2d66;
}

body {
  background-color: #111827; /* Немного смягчим фон */
  color: #d1d5db; /* Сделаем текст чуть менее резким */
}

/* Эффект свечения для текста */
.text-glow {
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}

/* Плавные переходы для интерактивных элементов */
button,
textarea,
input,
label {
  transition: all 0.2s ease-in-out;
}

/* Кастомный скроллбар под нашу тему */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #1f2937;
}
::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
/* Узкий контейнер для всего приложения */
.container-narrow {
  max-width: 1100px; /* можешь поставить 960px/1200px если хочешь уже/шире */
  margin: 0 auto;
  padding: 16px;
}

@media (min-width: 768px) {
  .container-narrow { padding: 24px; }
}
@media (min-width: 1024px) {
  .container-narrow { padding: 32px; }
}

/* Поддержка чуть более тёмных карточек */
.bg-gray-850 {
  background-color: #1b2332; /* мягкий тёмный между 800 и 900 */
}


```

---

## Файл: `src/app/layout.tsx`

```typescript
//D:\Work\Image test for 3Dims (3 models)\ai-renderer-arena\src\app\layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "AI Renderer Arena",
  description: "Instruction-Based Image Editing Testbed",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

```

---

## Файл: `src/app/page.tsx`

```typescript
//D:\Work\Image test for 3Dims (3 models)\ai-renderer-arena\src\app\page.tsx
import ImageWorkspace from "@/components/ImageWorkspace";

export default function HomePage() {
  return (
    <main>
      <div className="container-narrow">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 text-glow">AI Renderer Arena</h1>
          <p className="text-gray-400 text-sm mt-1">
            Instruction-Based Image Editing • аккуратно и без лишнего растягивания
          </p>
        </header>

        <ImageWorkspace />
      </div>
    </main>
  );
}

```

---

## Файл: `src/app/api/generate/route.ts`

```typescript
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
  image_url?: string;
  image_urls?: string[];
  negative_prompt?: string;
  seed?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  safety_tolerance?: number;
  sync_mode?: boolean; // <--- ДОБАВИЛИ
  image_size?: { width: number, height: number }; // <--- ДОБАВИЛИ
}

// Папка автосейва (env > дефолт)
const SAVE_DIR =
  process.env.IMAGES_SAVE_PATH ||
  "D:\\Work\\images from Image test for 3Dims (3 models)";

// Метки для префикса файлов
const MODEL_LABELS: Record<string, string> = {
  qwen: "qwen",
  flux: "flux",
  seedream: "sdream",
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

         case "seedream":
        endpointUrl = "https://fal.run/fal-ai/bytedance/seedream/v4/edit";
        body.image_urls = [imageUrl];
        body.sync_mode = true; // Важно для получения результата сразу

        if (settings.seed != null) {
          body.seed = settings.seed;
        }
        if (settings.width != null && settings.height != null) {
          body.image_size = { width: settings.width, height: settings.height };
        }
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

```

---

## Файл: `src/app/api/refine-prompt/route.ts`

```typescript
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

```

---

## Файл: `src/components/ImageWorkspace.tsx`

```typescript
// src/components/ImageWorkspace.tsx
"use client";

import React from "react";
import { useImageWorkspace } from "@/hooks/useImageWorkspace";
import { Sidebar } from "./workspace/Sidebar";
import { Canvas } from "./workspace/Canvas";

export default function ImageWorkspace() {
  // Вся сложность спрятана здесь. Мы получаем готовый 'контракт'.
  const workspaceState = useImageWorkspace();

  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6"
      onKeyDown={workspaceState.onKeyDown}
      tabIndex={0}
    >
      {/* Передаем весь набор состояний и функций в сайдбар.
        Ему не нужно знать, откуда они берутся.
      */}
      <Sidebar {...workspaceState} />

      {/* Передаем только то, что нужно для отображения.
      */}
      <Canvas
        isLoading={workspaceState.isLoading}
        resultUrl={workspaceState.resultUrl}
        sourceUrl={workspaceState.sourceUrl}
        sourceFile={workspaceState.sourceFile}
        tab={workspaceState.tab}
        setTab={workspaceState.setTab}
        comparePos={workspaceState.comparePos}
        setComparePos={workspaceState.setComparePos}
        results={workspaceState.results}
        handleSelectResult={workspaceState.handleSelectResult}
      />
    </div>
  );
}
```

---

## Файл: `src/components/ui/FormControls.tsx`

```typescript
// src/components/ui/FormControls.tsx

import React, { ChangeEvent } from "react";
import { cx } from "@/lib/utils";

/** --- Маленький компонент для заголовков --- */
export const Label: React.FC<{
  title: string;
  right?: React.ReactNode;
  className?: string;
}> = ({ title, right, className }) => (
  <div className={cx("flex items-center justify-between mb-1.5", className)}>
    <span className="text-xs text-gray-300">{title}</span>
    {right}
  </div>
);

/** --- Компонент слайдера с заголовком и полем ввода --- */
export const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  info?: string;
  name: string;
}> = ({ label, value, min, max, step, onChange, info, name }) => (
  <label className="block space-y-1">
    <Label
      title={label}
      right={
        <input
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          name={name}
          className="w-20 bg-gray-900 border border-gray-700 rounded p-1.5 text-xs text-center"
        />
      }
    />
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      name={name}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
    {info && <p className="text-[10px] text-gray-500">{info}</p>}
  </label>
);
```

---

## Файл: `src/components/workspace/Canvas.tsx`

```typescript
// src/components/workspace/Canvas.tsx

import React from "react";
import { cx } from "@/lib/utils";

// <<< НОВОЕ: Отдельный компонент для галереи, чтобы не мусорить
const ResultsGallery: React.FC<{
  images: string[];
  onSelect: (url: string) => void;
}> = ({ images, onSelect }) => {
  return (
    <div className="bg-gray-850 border border-gray-800 rounded-xl">
      <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
        Галерея результатов (кликни, чтобы доработать)
      </div>
      <div className="p-3 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
        {images.map((url, index) => (
          <button
            key={url}
            onClick={() => onSelect(url)}
            className="aspect-square bg-gray-900 rounded-md overflow-hidden hover:ring-2 ring-cyan-500 transition-all focus:outline-none focus:ring-2"
            title={`Выбрать результат #${index + 1} для доработки`}
          >
            <img
              src={url}
              alt={`Result ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};


// <<< ИЗМЕНЕНО: Пропсы для управления состоянием и отображением
interface CanvasProps {
  isLoading: boolean;
  resultUrl: string | null;
  sourceUrl: string | null;
  sourceFile: File | null;
  tab: "source" | "result" | "compare";
  setTab: (tab: "source" | "result" | "compare") => void;
  comparePos: number;
  setComparePos: (pos: number) => void;
  // <<< НОВОЕ: Пропсы для галереи
  results: string[];
  handleSelectResult: (url: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  isLoading,
  resultUrl,
  sourceUrl,
  sourceFile,
  tab,
  setTab,
  comparePos,
  setComparePos,
  // <<< НОВОЕ: Получаем пропсы для галереи
  results,
  handleSelectResult,
}) => {
  // Инкапсулируем логику скачивания прямо здесь
  const handleDownloadSource = () => {
    if (!sourceUrl || !sourceFile) return;
    const link = document.createElement("a");
    link.href = sourceUrl;
    link.download = sourceFile.name || "source.png";
    link.click();
  };

  const handleDownloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "result.png";
    link.click();
  };

  return (
    <section className="space-y-4">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {isLoading
            ? "Обработка…"
            : resultUrl
            ? "Готово"
            : "Ожидает запуска"}
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-1 flex">
            {(["source", "result", "compare"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cx(
                  "px-3 py-1.5 text-xs rounded-md",
                  tab === t
                    ? "bg-gray-800 text-gray-100"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                {t === "source"
                  ? "Исходник"
                  : t === "result"
                  ? "Результат"
                  : "Сравнить"}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadSource}
            disabled={!sourceUrl}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Скачать исходник
          </button>

          <button
            onClick={handleDownloadResult}
            disabled={!resultUrl}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Скачать результат
          </button>
        </div>
      </div>

      {/* canvases */}
      <div className="bg-gray-850 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
          {tab === "source"
            ? "Исходное изображение"
            : tab === "result"
            ? "Результат"
            : "Сравнение (двигай слайдер)"}
        </div>

       <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
  {/* --- ОБЩИЙ БЛОК ДЛЯ ВСЕХ СОСТОЯНИЙ --- */}
  
  {/* Исходник (виден всегда, кроме таба "Результат") */}
  {tab !== "result" && !sourceUrl && (
    <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
      Загрузите изображение
    </div>
  )}
  {tab !== "result" && sourceUrl && (
    <img
      src={sourceUrl}
      alt="Source"
      className="absolute inset-0 w-full h-full object-contain"
    />
  )}

  {/* Результат (виден только в табах "Результат" и "Сравнение") */}
  {tab !== "source" && !resultUrl && (
    <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
      Пока пусто
    </div>
  )}
  {tab === "result" && resultUrl && (
    <img
      src={resultUrl}
      alt="Result"
      className="absolute inset-0 w-full h-full object-contain"
    />
  )}

  {/* Блок сравнения (активен только в табе "Сравнение" и если есть обе картинки) */}
  {tab === "compare" && sourceUrl && resultUrl && (
    <>
      {/* Исходник уже отрендерен выше как фон, теперь рендерим результат поверх с обрезкой */}
      <img
        src={resultUrl}
        alt="Result (clipped)"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }}
      />
      <div
        className="absolute inset-y-0 w-0.5 bg-cyan-500/70 pointer-events-none"
        style={{ left: `${comparePos}%` }}
      />
      <input
        type="range"
        min={0}
        max={100}
        value={comparePos}
        onChange={(e) => setComparePos(Number(e.target.value))}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[60%] h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
    </>
  )}

  {/* Оверлей загрузки (поверх всего) */}
  {isLoading && (
    <div
      className="absolute inset-0 bg-gray-800/50 animate-pulse"
      aria-label="loading"
    />
  )}
</div>
      </div>

      {/* <<< НОВОЕ: Рендерим галерею, если есть результаты */}
      {results.length > 0 && (
        <ResultsGallery images={results} onSelect={handleSelectResult} />
      )}

      <div className="text-[11px] text-gray-500">
        Лайфхак: короткий промпт → выбери модель → Ctrl/Cmd+Enter. Вставка из
        буфера работает.
      </div>
    </section>
  );
};
```

---

## Файл: `src/components/workspace/Sidebar.tsx`

```typescript
// src/components/workspace/Sidebar.tsx

import React, { ChangeEvent, DragEvent, RefObject } from "react";
import { cx } from "@/lib/utils";
import {
  ACCEPTED_FILE_TYPES,
  FluxSettings,
  LlmSettings,
  MAX_FILE_SIZE_MB,
  Model,
  QwenSettings,
  SeedreamSettings,
} from "@/lib/types";
import { Label, Slider } from "@/components/ui/FormControls";

// Определяем все пропсы, которые понадобятся этому компоненту
interface SidebarProps {
  imageInfo: { w: number; h: number } | null;
  sourceFile: File | null;
  dropRef: RefObject<HTMLLabelElement>;
  onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showRefiner: boolean;
  setShowRefiner: (value: React.SetStateAction<boolean>) => void;
  rawPrompt: string;
  setRawPrompt: (value: string) => void;
  llmSettingsByModel: { [key in Model]?: Partial<LlmSettings> }; // <<< ИЗМЕНЕНО
  handleLlmSettingsChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  sendImageToLlm: boolean;
  setSendImageToLlm: (value: boolean) => void;
  onRefinePrompt: () => void;
  isRefining: boolean;
  refineError: string | null;
  prompt: string;
  setPrompt: (value: string) => void;
  showNeg: boolean;
  setShowNeg: (value: React.SetStateAction<boolean>) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
  seedLock: boolean;
  setSeedLock: (value: boolean) => void;
  randomizeSeed: () => void;
  qwenSettings: QwenSettings;
  handleQwenChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fluxSettings: FluxSettings;
  handleFluxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  seedreamSettings: SeedreamSettings;
  handleSeedreamChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isReadyToGenerate: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onCancel: () => void;
  onClear: () => void;
  error: string | null;
  jsonContent: string | null;
  isJsonViewerOpen: boolean;
  setIsJsonViewerOpen: (value: React.SetStateAction<boolean>) => void;
  jsonError: string | null;
  onJsonFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isDetailingMode: boolean;
  promptTokenCount: number;
  negativeTokenCount: number;
  seedreamTargetSize: 1024 | 1280 | 'original';
  setSeedreamTargetSize: (size: 1024 | 1280 | 'original') => void;
  seedreamSizeWarning: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  imageInfo,
  sourceFile,
  dropRef,
  onDrop,
  onFileChange,
  showRefiner,
  setShowRefiner,
  rawPrompt,
  setRawPrompt,
  llmSettingsByModel,
  handleLlmSettingsChange,
  sendImageToLlm,
  setSendImageToLlm,
  onRefinePrompt,
  isRefining,
  refineError,
  prompt,
  setPrompt,
  showNeg,
  setShowNeg,
  negativePrompt,
  setNegativePrompt,
  selectedModel,
  setSelectedModel,
  seedLock,
  setSeedLock,
  randomizeSeed,
  qwenSettings,
  handleQwenChange,
  fluxSettings,
  handleFluxChange,
  seedreamSettings,
  handleSeedreamChange,
  isReadyToGenerate,
  isLoading,
  onGenerate,
  onCancel,
  onClear,
  error,
  jsonContent,
  isJsonViewerOpen,
  setIsJsonViewerOpen,
  jsonError,
  onJsonFileChange,
  isDetailingMode,
  promptTokenCount,
  negativeTokenCount,
  seedreamTargetSize,
  setSeedreamTargetSize,
  seedreamSizeWarning,
}) => {
  const activeLlmSettings = React.useMemo(() => {
    const defaults = {
      model: 'gpt-5-mini',
      systemPrompt: '',
      temperature: 1.0,
      topP: 1,
      maxCompletionTokens: 2000,
    };
    return { ...defaults, ...llmSettingsByModel[selectedModel] };
  }, [llmSettingsByModel, selectedModel]);

  return (
    <aside className="bg-gray-850 border border-gray-800 rounded-xl p-4 lg:p-5 sticky top-6 h-fit">
      {/* file */}
      <div className="space-y-2">
        <Label
          title={isDetailingMode ? "Изображение для доработки" : "Исходное изображение"}
          right={
            imageInfo && (
              <span className="text-[10px] text-gray-500">
                {imageInfo.w}×{imageInfo.h}px
              </span>
            )
          }
        />
        <label
          ref={dropRef}
          htmlFor="image-upload"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cx(
            "group border border-dashed rounded-lg p-4 text-center cursor-pointer transition",
            "border-gray-700 hover:border-cyan-500 bg-gray-900/50"
          )}
          title="Перетащи файл или кликни. Можно также вставить из буфера Ctrl+V."
        >
          {sourceFile ? (
            <div className="text-left space-y-1">
              <p className="text-cyan-400 text-sm font-medium truncate">
                {sourceFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(sourceFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                {sourceFile.type.replace("image/", "").toUpperCase()}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-400">
                Перетащи или нажми, чтобы выбрать
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPEG, WebP • до {MAX_FILE_SIZE_MB}MB • Ctrl+V из буфера
              </p>
            </div>
          )}
          <input
            id="image-upload"
            type="file"
            className="hidden"
            accept={ACCEPTED_FILE_TYPES.join(",")}
            onChange={onFileChange}
          />
        </label>
      </div>

      {/* JSON Viewer */}
      <div className="mt-5 space-y-3 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
        <button
          type="button"
          onClick={() => setIsJsonViewerOpen((v) => !v)}
          className="w-full text-left text-sm font-medium text-yellow-400"
        >
          {isJsonViewerOpen ? "▼ Скрыть JSON Viewer" : "► Открыть JSON Viewer"}
        </button>
        {isJsonViewerOpen && (
          <div className="pt-2 space-y-3">
            <label
              htmlFor="json-upload"
              className="block w-full text-center text-xs text-gray-400 border border-dashed border-gray-600 hover:border-yellow-500 rounded-md p-3 cursor-pointer"
            >
              Нажми, чтобы выбрать .json файл
              <input
                id="json-upload"
                type="file"
                className="hidden"
                accept="application/json"
                onChange={onJsonFileChange}
              />
            </label>

            {jsonError && (
              <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded-md">
                {jsonError}
              </p>
            )}

            {jsonContent && (
              <pre className="bg-gray-950 p-2 rounded-md text-xs text-gray-300 max-h-60 overflow-auto whitespace-pre-wrap">
                <code>{jsonContent}</code>
              </pre>
            )}
          </div>
        )}
      </div>
      
      {/* <<< ИЗМЕНЕНИЕ: Весь блок промпт-инженера теперь показывается по условию */}
      {!isDetailingMode && (
        <div
          className="mt-5 space-y-3 border border-gray-700/50 rounded-lg p-3"
          style={{ backgroundColor: "#221b25ff" }}
        >
          <button
            type="button"
            onClick={() => setShowRefiner((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400"
          >
            {showRefiner
              ? "▼ Скрыть «Промпт-Инженер»"
              : "► Открыть «Промпт-Инженер»"}
          </button>
          {showRefiner && (
            <div className="pt-2 space-y-4">
              <div>
                <Label title="1. Сообщение для LLM" />
                <textarea
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Опиши задачу простыми словами (напр.: стены кедр, лавки осина)"
                  value={rawPrompt}
                  onChange={(e) => setRawPrompt(e.target.value)}
                />
              </div>

              <div>
                <Label title="2. Системный промпт для LLM" />
                <textarea
                  name="systemPrompt"
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={activeLlmSettings.systemPrompt}
                  onChange={handleLlmSettingsChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label title="Модель" />
                  <div className="flex items-center gap-2 rounded-lg bg-gray-950 p-1">
                    {(["gpt-5-mini", "gpt-5-nano"] as const).map((model) => (
                      <button
                        key={model}
                        onClick={() =>
                        // Имитируем событие для нашего универсального хендлера
                        handleLlmSettingsChange({
                          target: { name: 'model', value: model },
                        } as any)
                      }
                        className={`w-full px-2 py-1 text-xs rounded-md transition-colors ${
                        activeLlmSettings.model === model
                          ? "bg-cyan-600 text-white"
                          : "hover:bg-gray-800"
                      }`}
                      >
                        {model.replace("gpt-5-", "GPT-5 ")}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex flex-col justify-end items-start gap-2 text-xs text-gray-400 cursor-pointer">
                  <Label title="Контекст" />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sendImageToLlm}
                      onChange={(e) => setSendImageToLlm(e.target.checked)}
                      className="accent-cyan-500"
                      disabled={!sourceFile}
                    />
                    Отправить картинку
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-gray-800 space-y-4">
                <Slider
                  label="Temperature"
                  name="temperature"
                  value={activeLlmSettings.temperature}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={handleLlmSettingsChange}
                />
                <Slider
                  label="Top P"
                  name="topP"
                  value={activeLlmSettings.topP}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={handleLlmSettingsChange}
                />
                <Slider
                  label="Max Tokens"
                  name="maxCompletionTokens"
                  value={activeLlmSettings.maxCompletionTokens}
                  min={50}
                  max={1000}
                  step={10}
                  onChange={handleLlmSettingsChange}
                />
              </div>

              <div className="text-center">
                <button
                  onClick={onRefinePrompt}
                  disabled={!rawPrompt.trim() || isRefining}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-md bg-cyan-700 hover:bg-cyan-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isRefining ? "Улучшаю..." : "✓ Улучшить и применить промпт"}
                </button>
              </div>

              {refineError && (
                <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded-md">
                  {refineError}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* prompt */}
      <div className="mt-5 space-y-2">
        <Label
          title={isDetailingMode ? "Опишите правку" : "Инструкция для генерации"}
          right={
            <span className="text-[10px] text-gray-500">
              Токены: {promptTokenCount}
            </span>
          }
        />
        <textarea
          rows={5}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder={isDetailingMode ? "Напр.: Add a white towel on the bench" : "Напр.: Change the walls to photorealistic Canadian cedar..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

         <button
          type="button"
          onClick={() => setShowNeg((v) => !v)}
          className="text-xs text-gray-400 hover:text-gray-200 transition underline underline-offset-4"
        >
          {showNeg ? "Скрыть негативный промпт" : `Показать негативный промпт (${negativeTokenCount} токенов)`}
        </button>

        {showNeg && (
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Что НЕ нужно видеть"
          />
        )}
      </div>

      {/* model */}
      <div className="mt-5 space-y-2">
        <Label title="Модель" />
        <div className="grid grid-cols-4 gap-2">
          {(["flux", "qwen", "seedream", "gemini"] as Model[]).map((m) => {
            const isActive = selectedModel === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={cx(
                  "py-2.5 rounded-lg text-xs font-bold uppercase transition-all duration-200",
                  isActive
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                    : "bg-gray-900 border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600"
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* settings */}
      <div className="mt-5 pt-4 border-t border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-200">Параметры</h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[11px] text-gray-400">
              <input
                type="checkbox"
                checked={seedLock}
                onChange={(e) => setSeedLock(e.target.checked)}
                className="accent-cyan-500"
              />
              Фиксировать seed
            </label>
            <button
              type="button"
              onClick={randomizeSeed}
              className="text-[11px] px-2 py-1 rounded border border-gray-700 text-gray-300 hover:bg-gray-800"
              title="Случайный seed"
            >
              🎲
            </button>
          </div>
        </div>

        {selectedModel === "qwen" && (
          <>
            <Slider
              label="Guidance scale"
              value={qwenSettings.guidance_scale}
              min={1}
              max={10}
              step={0.1}
              onChange={handleQwenChange}
              name="guidance_scale"
            />
            <Slider
              label="Inference Steps"
              value={qwenSettings.num_inference_steps}
              min={10}
              max={60}
              step={1}
              onChange={handleQwenChange}
              name="num_inference_steps"
            />
            <Slider
              label="Seed"
              value={qwenSettings.seed}
              min={0}
              max={2147483647}
              step={1}
              onChange={handleQwenChange}
              name="seed"
            />
          </>
        )}

        {selectedModel === "flux" && (
          <>
            <Slider
              label="Guidance scale (CFG)"
              value={fluxSettings.guidance_scale}
              min={0}
              max={10}
              step={0.1}
              onChange={handleFluxChange}
              name="guidance_scale"
            />
            <Slider
              label="Safety Tolerance"
              value={fluxSettings.safety_tolerance}
              min={0}
              max={10}
              step={0.5}
              onChange={handleFluxChange}
              name="safety_tolerance"
              info="Большее — строже safety и потенциальный кроп."
            />
            <Slider
              label="Seed"
              value={fluxSettings.seed}
              min={0}
              max={2147483647}
              step={1}
              onChange={handleFluxChange}
              name="seed"
            />
          </>
        )}

        {selectedModel === "seedream" && (
          <>
            {/* <<< НАШ НОВЫЙ БЛОК УПРАВЛЕНИЯ РАЗМЕРОМ */}
            <div>
              <Label title="Размер вывода (длинная сторона)" />
              <div className="grid grid-cols-3 gap-2">
                {([1024, 1280, 'original'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSeedreamTargetSize(size)}
                    className={cx(
                      "py-2 rounded-md text-xs font-semibold",
                      seedreamTargetSize === size
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-900 text-gray-400 hover:bg-gray-800"
                    )}
                  >
                    {size === 'original' ? 'Оригинал' : `${size}px`}
                  </button>
                ))}
              </div>
            </div>
            {/* КОНЕЦ НОВОГО БЛОКА */}
            {seedreamSizeWarning && (
              <p className="text-[11px] text-yellow-300 bg-yellow-900/40 border border-yellow-800/50 p-2 rounded-md mt-2">
                {seedreamSizeWarning}
              </p>
            )}

            <Slider
              label="Seed"
              value={seedreamSettings.seed}
              min={0}
              max={2147483647}
              step={1}
              onChange={handleSeedreamChange}
              name="seed"
            />
          </>
        )}

        {selectedModel === "gemini" && (
          <p className="text-xs text-gray-500">
            Для Gemini пока нет доп. параметров.
          </p>
        )}
      </div>

      {/* actions */}
      <div className="mt-5 space-y-3">
        <button
          onClick={onGenerate}
          disabled={!isReadyToGenerate}
          className={cx(
            "w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition",
            isReadyToGenerate
              ? "bg-cyan-600 hover:bg-cyan-500 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
          title="Ctrl/Cmd+Enter — тоже сработает"
        >
          {isLoading ? "Генерация..." : isDetailingMode ? "Доработать" : "Сгенерировать"}
        </button>

        <div className="flex items-center justify-between">
          {isLoading ? (
            <button
              onClick={onCancel}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Отменить (Esc)
            </button>
          ) : (
            <button
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Очистить
            </button>
          )}
          {sourceFile && (
            <span className="text-[11px] text-gray-500">
              {sourceFile.type.replace("image/", "").toUpperCase()}
            </span>
          )}
        </div>

        {error && (
          <div className="text-red-300 text-xs bg-red-900/20 border border-red-800/40 rounded p-2">
            <p className="font-semibold">Ошибка</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </aside>
  );
};
```

---

## Файл: `src/hooks/useImageWorkspace.ts`

```typescript
// src/hooks/useImageWorkspace.ts

import { useState, useMemo, useEffect, useRef, ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { encode } from "gpt-tokenizer";
import { FluxSettings, LlmSettings, Model, QwenSettings, SeedreamSettings } from "@/lib/types";
import { loadPersist, readImageDims, savePersist } from "@/lib/utils";

const defaultLlmSettings: LlmSettings = {
  model: 'gpt-5-mini',
  systemPrompt: `Ты — «Промт-Инженер», специализированный AI-аналитик. Твоя задача — анализировать сырые входные данные (изображение-чертеж сауны и текстовый список материалов с уже готовыми описаниями) и скомпоновать из них сверхкороткий, убийственно-точный промт для AI-«Художника» (модели типа Qwen-Image-Edit, FLUX).
Твои руководящие принципы:
Контекст: «Художники» (Qwen-Image-Edit и аналоги) держат фокус на первых 4-5 строках. Всё, что дальше — лотерея. Твой итоговый промт должен быть как телеграмма: максимум смысла в минимуме слов.
Фильтрация: На входе — чертеж и список материалов. Черные области на чертеже — это не дизайн, а дыры (окна, двери), которые нужно заполнить. Работай только с видимыми объектами и соответствующими им материалами из списка.
АЛГОРИТМ СБОРКИ ИТОГОВОГО ПРОМТА ДЛЯ «ХУДОЖНИКА»:
Твой итоговый промт должен иметь железобетонную структуру. Собирай его строго в этом порядке.
БЛОК 1: ЗАДАЧА, ГЕОМЕТРИЯ И ЧЕРНЫЕ ДЫРЫ (Высший приоритет)
Инструкция: Начинай промт с общей задачи, в которую вшито главное ограничение по геометрии. Сразу после, если видишь черные области, добавь команды для их замены. Это самый важный блок.
Шаблоны для генерации:
Преамбула: You are editing a 3D render to create a masterpiece. Preserve the exact geometry, proportions, and camera FOV.
Окно: ⚡ A black area on the wall = A photorealistic glass window with a thin wooden frame matching the reference, viewing a Scandinavian forest.
Панорамная стена: ⚡ A black wall = A panoramic, floor-to-ceiling glass wall with a thin frame matching the reference, viewing a Scandinavian forest. (Используй, если черная область занимает почти всю стену).
Дверь: ⚡ A black doorway = A frameless glass door leading into a bright, minimalist entryway finished with the same wood as the sauna walls.
БЛОК 2: МАТЕРИАЛЫ («Прямой проброс»)
Инструкция: Это твоя основная работа. Твоя задача — взять готовую строку с описанием материала из списка клиента и напрямую вставить ее в итоговый промт. Ничего не додумывай. Просто сгруппируй объекты с одинаковым материалом и передай описание как есть.
Формат генерации: [Объект 1], [Объект 2]: [Описание из списка клиента]. [Объект 3]: [Другое описание из списка].
Пример того, что ты должен сгенерить: Walls, floor: Canadian Cedar polished, with clear texture. Benches: Linden wood.
БЛОК 3: СВЕТ
Инструкция: После материалов добавь короткую, ясную команду по свету.
Шаблон для генерации: The lighting must be warm and soft with physically correct shadows; if a window is present, add contrasting cool daylight.
БЛОК 4: ФИНАЛЬНОЕ КАЧЕСТВО (Приказ)
Инструкция: В самом конце промта добавь одну мощную команду, которая задает финальную планку качества.
Шаблон для генерации: Elevate the entire image to the quality of an architectural magazine cover, focusing on photorealistic lighting and textures.
Формат вывода: Итоговый промт для «Художника» не должен превышать 5-7 предложений (примерно 200-250 токенов). Будь безжалостен к каждому слову.

'.`,
  temperature: 1.0,
  topP: 1,
  maxCompletionTokens: 2000,
};

const initialLlmSettingsByModel: { [key in Model]?: Partial<LlmSettings> } = {
  gemini: { ...defaultLlmSettings },
  qwen: { ...defaultLlmSettings, systemPrompt: "СИСТЕМНЫЙ ПРОМТ ДЛЯ QWEN" },
  flux: { ...defaultLlmSettings, systemPrompt: "СИСТЕМНЫЙ ПРОМТ ДЛЯ FLUX" },
  seedream: { ...defaultLlmSettings, systemPrompt: "СИСТЕМНЫЙ ПРОМТ ДЛЯ SEEDREAM" },
};

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function useImageWorkspace() {
  // --- Состояния (State) ---
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [rawPrompt, setRawPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [sendImageToLlm, setSendImageToLlm] = useState(true);
  const [showRefiner, setShowRefiner] = useState(false);
  const [llmSettingsByModel, setLlmSettingsByModel] = useState(initialLlmSettingsByModel);
  const [negativePrompt, setNegativePrompt] = useState("blurry, ugly, deformed, text, watermark");
  const [showNeg, setShowNeg] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>("flux");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ w: number; h: number } | null>(null);
  const [tab, setTab] = useState<"source" | "result" | "compare">("source");
  const [comparePos, setComparePos] = useState(50);
  const [seedLock, setSeedLock] = useState(false);
  const [qwenSettings, setQwenSettings] = useState<QwenSettings>({ guidance_scale: 4, num_inference_steps: 30, seed: 0 });
  const [fluxSettings, setFluxSettings] = useState<FluxSettings>({ guidance_scale: 3.5, safety_tolerance: 2, seed: 0 });
  const [seedreamSettings, setSeedreamSettings] = useState<SeedreamSettings>({ seed: 0, width: 1024, height: 1024 });
  const [seedreamTargetSize, setSeedreamTargetSize] = useState<1024 | 1280 | 'original'>(1024);

  // <<< НОВОЕ: Состояния для режима детализации
  const [results, setResults] = useState<string[]>([]);
  const [isDetailingMode, setIsDetailingMode] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const dropRef = useRef<HTMLLabelElement | null>(null);

  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [promptTokenCount, setPromptTokenCount] = useState(0);
  const [negativeTokenCount, setNegativeTokenCount] = useState(0);
  const [seedreamSizeWarning, setSeedreamSizeWarning] = useState<string | null>(null);
  
  // --- Эффекты (Effects) ---

  // Загрузка состояния из localStorage при первом рендере
  useEffect(() => {
    const p = loadPersist();
    if (!p) return;

    setPrompt(p.prompt ?? "");
    setNegativePrompt(p.negativePrompt ?? "blurry, ugly, deformed, text, watermark");
    setSelectedModel(p.selectedModel ?? "flux");
    setQwenSettings(p.qwenSettings ?? { guidance_scale: 4, num_inference_steps: 30, seed: 0 });
    setFluxSettings(p.fluxSettings ?? { guidance_scale: 3.5, safety_tolerance: 2, seed: 0 });
    const loadedSeedream = p.seedreamSettings || {};
    setSeedreamSettings(prev => ({ ...{ seed: 0, width: 1024, height: 1024 }, ...loadedSeedream }));
    if (p.llmSettingsByModel) setLlmSettingsByModel(p.llmSettingsByModel);
    if (typeof p.sendImageToLlm === "boolean") setSendImageToLlm(p.sendImageToLlm);
    if (typeof p.showRefiner === "boolean") setShowRefiner(p.showRefiner);
    if (typeof p.showNeg === "boolean") setShowNeg(p.showNeg);
    if (typeof p.seedLock === "boolean") setSeedLock(p.seedLock);
    if (p.tab) setTab(p.tab);
    if (typeof p.comparePos === "number") setComparePos(p.comparePos);
    if (p.seedreamTargetSize) setSeedreamTargetSize(p.seedreamTargetSize);
  }, []);

  // Сохранение состояния в localStorage при изменении
  useEffect(() => {
    savePersist({
      prompt,
      negativePrompt,
      selectedModel,
      qwenSettings,
      fluxSettings,
      seedreamSettings,
      llmSettingsByModel,
      sendImageToLlm,
      showRefiner,
      showNeg,
      seedLock,
      tab,
      comparePos,
      seedreamTargetSize,
    });
  }, [
    prompt,
    negativePrompt,
    selectedModel,
    qwenSettings,
    fluxSettings,
    seedreamSettings,
    llmSettingsByModel,
    sendImageToLlm,
    showRefiner,
    showNeg,
    seedLock,
    tab,
    comparePos,
    seedreamTargetSize,
  ]);
  
  useEffect(() => {
    // Эта функция очистки сработает только перед тем,
    // как sourceUrl будет изменен на новый, или при размонтировании.
    return () => {
      if (sourceUrl && sourceUrl.startsWith("blob:")) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, [sourceUrl]); // <-- Зависимость ТОЛЬКО от sourceUrl

  // Эффект №2: Чистит URL галереи только один раз при размонтировании компонента.
  useEffect(() => {
    return () => {
      // Это нужно, если мы решим делать превьюшки через blob,
      // для обычных URL это не сработает, но пусть будет на будущее.
      results.forEach(url => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []); // <-- Пустой массив зависимостей = сработает 1 раз при unmount.
  
  // Обработчик вставки из буфера обмена
  useEffect(() => {
    const handler = (ev: ClipboardEvent) => onPaste(ev);
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, []);

  useEffect(() => {
    setPromptTokenCount(encode(prompt).length);
    setNegativeTokenCount(encode(negativePrompt).length);
  }, [prompt, negativePrompt]);
// --- Эффект для предупреждения о размере Seedream ---
  useEffect(() => {
    if (selectedModel !== 'seedream' || !imageInfo || seedreamTargetSize === 'original') {
      setSeedreamSizeWarning(null);
      return;
    }

    const { w: originalWidth, h: originalHeight } = imageInfo;
    const ratio = originalWidth / originalHeight;
    let targetWidth: number;
    let targetHeight: number;

    if (originalWidth >= originalHeight) {
      targetWidth = seedreamTargetSize;
      targetHeight = Math.round(targetWidth / ratio);
    } else {
      targetHeight = seedreamTargetSize;
      targetWidth = Math.round(targetHeight * ratio);
    }

    if (targetWidth < 1024 || targetHeight < 1024) {
      const minSide = Math.min(targetWidth, targetHeight);
      const scaleFactor = 1024 / minSide;
      const finalWidth = Math.round(targetWidth * scaleFactor);
      const finalHeight = Math.round(targetHeight * scaleFactor);
      
      setSeedreamSizeWarning(`Внимание: Запрошенный размер слишком мал. Результат будет увеличен до ${finalWidth}x${finalHeight}px.`);
    } else {
      setSeedreamSizeWarning(null);
    }
  }, [selectedModel, imageInfo, seedreamTargetSize]);

  // --- Обработчики и логика ---

  const handleQwenChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQwenSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };
  const handleFluxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFluxSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };
  const handleSeedreamChange = (e: ChangeEvent<HTMLInputElement>) => { 
    setSeedreamSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };
  
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || (e.target as HTMLElement).tagName !== "TEXTAREA")) {
      e.preventDefault();
      onGenerate();
    }
    if (e.key === "Escape") {
      if (isLoading) onCancel();
    }
  };

  const handleLlmSettingsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) : value;

    setLlmSettingsByModel(prev => {
      const currentModelSettings = prev[selectedModel] ?? {};
      return {
        ...prev,
        [selectedModel]: {
          ...currentModelSettings,
          [name]: parsedValue,
        },
      };
    });
  };
  
  const onRefinePrompt = async () => {
    if (!rawPrompt.trim()) return;
    setIsRefining(true);
    setRefineError(null);
    abortControllerRef.current = new AbortController();

    function arrayBufferToBase64(buffer: ArrayBuffer): string {
      let binary = "";
      const bytes = new Uint8Array(buffer);
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      return btoa(binary);
    }

    let base64Image: string | undefined = undefined;
    if (sendImageToLlm && sourceFile) {
      const buffer = await sourceFile.arrayBuffer();
      base64Image = `data:${sourceFile.type};base64,${arrayBufferToBase64(buffer)}`;
    }

    const activeSettings = { ...defaultLlmSettings, ...llmSettingsByModel[selectedModel] };
    const payload = {
      prompt: rawPrompt,
      model: activeSettings.model,
      system: activeSettings.systemPrompt,
      temperature: activeSettings.temperature,
      top_p: activeSettings.topP,
      max_completion_tokens: activeSettings.maxCompletionTokens,
      ...(base64Image ? { image: base64Image } : {}),
    };

    try {
      const response = await fetch("/api/refine-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Неизвестная ошибка API");
      }

      const data = await response.json();
      setPrompt(data.refinedPrompt);
      setShowRefiner(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setRefineError("Улучшение отменено.");
        else setRefineError(e.message);
      } else {
        setRefineError("Произошла неизвестная ошибка.");
      }
    } finally {
      setIsRefining(false);
    }
  };

  const isReadyToGenerate = useMemo(() => !!sourceFile && !!prompt.trim() && !isLoading, [sourceFile, prompt, isLoading]);

  const fail = (msg: string) => {
    setError(msg);
    setIsLoading(false);
  };

  // <<< ИЗМЕНЕНО: handleFileSelect теперь сбрасывает режим детализации
  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return fail(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB} MB.`);
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) return fail("Неверный тип файла. Используйте PNG, JPEG или WebP.");
    
    setError(null);
    setResultUrl(null);
    setTab("source");
    
    // <<< Сброс состояния галереи и режима при загрузке нового файла
    setResults([]);
    setIsDetailingMode(false);
    setSeedreamSizeWarning(null);
    

    setSourceFile(file);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    setSourceUrl(url);

    try {
      const dims = await readImageDims(file);
      setImageInfo(dims);
    } catch {
      setImageInfo(null);
    }
  };
  
  const handleJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (typeof event.target?.result !== 'string') {
          throw new Error("Не удалось прочитать файл.");
        }
        const parsed = JSON.parse(event.target.result);
        setJsonContent(JSON.stringify(parsed, null, 2)); 
        setJsonError(null);
        setIsJsonViewerOpen(true);
      } catch (e) {
        setJsonError("Ошибка парсинга. Убедись, что это валидный JSON-файл.");
        setJsonContent(null);
      }
    };
    reader.onerror = () => {
      setJsonError("Не удалось прочитать файл.");
      setJsonContent(null);
    };
    reader.readAsText(file);
  };

  const onJsonFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      handleJsonFile(file);
    } else if (file) {
      setJsonError("Неверный тип файла. Нужен JSON.");
    }
    e.target.value = "";
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };
  
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };
  
  const onPaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const it of items) {
      if (it.type.startsWith("image/")) {
        const file = it.getAsFile();
        if (file) {
          await handleFileSelect(file);
          break;
        }
      }
    }
  };

  // <<< ИЗМЕНЕНО: onClear теперь тоже сбрасывает галерею и режим
  const onClear = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceFile(null);
    setSourceUrl(null);
    setResultUrl(null);
    setError(null);
    setPrompt("");
    setImageInfo(null);
    setTab("source");
    setShowRefiner(false);
    setShowNeg(false);
    setSendImageToLlm(true);
    setSeedLock(false);
    setComparePos(50);
    // <<< Сброс состояния галереи и режима
    setResults([]);
    setIsDetailingMode(false);
    setSeedreamTargetSize(1024);
    setSeedreamSizeWarning(null);
  };

  const onCancel = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setError("Генерация отменена.");
  };

  const randomizeSeed = () => {
    const seed = Math.floor(Math.random() * 2_147_483_647);
    if (selectedModel === "flux") setFluxSettings((p) => ({ ...p, seed }));
    if (selectedModel === "qwen") setQwenSettings((p) => ({ ...p, seed }));
    if (selectedModel === "seedream") setSeedreamSettings((p) => ({...p, seed }));
  };
  
  // <<< НОВОЕ: Функция для выбора результата из галереи как нового исходника
  const handleSelectResult = async (url: string) => {
    setIsLoading(true); // Блокируем интерфейс на время подготовки файла
    setError(null);
    
    try {
      // Скачиваем картинку по URL и превращаем в File
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "generated_source.png", { type: blob.type });

      // Обновляем состояния, как будто загрузили новый файл
      setSourceFile(file);
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      const newSourceUrl = URL.createObjectURL(file);
      setSourceUrl(newSourceUrl);

      setResultUrl(null);
      
      const dims = await readImageDims(file);
      setImageInfo(dims);
      
      // Переключаемся в режим детализации и очищаем промпт
      setIsDetailingMode(true);
      setPrompt(""); // Очищаем поле для новой, короткой инструкции
      setTab("source"); // Показываем новый исходник
      
    } catch (e) {
        fail("Не удалось загрузить изображение для доработки.");
    } finally {
        setIsLoading(false);
    }
  };
  
  // <<< ИЗМЕНЕНО: Основная функция генерации теперь учитывает режим
  const onGenerate = async () => {
    if (!isReadyToGenerate || !sourceFile) return;
    setIsLoading(true);
    setError(null);
    // Не очищаем resultUrl, чтобы последняя картинка не пропадала во время генерации новой
    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append("image", sourceFile);
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", selectedModel);

    let settings: QwenSettings | FluxSettings | SeedreamSettings;
    switch (selectedModel) {
      case "qwen":
        settings = qwenSettings;
        break;
      case "seedream": { 
        let targetWidth = imageInfo!.w;
        let targetHeight = imageInfo!.h;
  
        if (seedreamTargetSize !== 'original') {
          const originalWidth = imageInfo!.w;
          const originalHeight = imageInfo!.h;
          const ratio = originalWidth / originalHeight;
          const targetSide = seedreamTargetSize;
  
          if (originalWidth >= originalHeight) {
            targetWidth = targetSide;
            targetHeight = Math.round(targetSide / ratio);
          } else {
            targetHeight = targetSide;
            targetWidth = Math.round(targetSide * ratio);
          }
        }

        // <<< ФИНАЛЬНАЯ ПРОВЕРКА И АПСКЕЙЛ ПЕРЕД ОТПРАВКОЙ
        if (targetWidth < 1024 || targetHeight < 1024) {
            const minSide = Math.min(targetWidth, targetHeight);
            const scaleFactor = 1024 / minSide;
            targetWidth = Math.round(targetWidth * scaleFactor);
            targetHeight = Math.round(targetHeight * scaleFactor);
        }
        
        settings = { ...seedreamSettings, width: targetWidth, height: targetHeight };
        break;
      }
      case "flux":
      default:
        settings = fluxSettings;
        break;
    }
    
    if (!seedLock) {
      const seed = Math.floor(Math.random() * 2_147_483_647);
      settings = { ...settings, seed };
      if (selectedModel === "qwen") setQwenSettings(p => ({ ...p, seed }));
      if (selectedModel === "seedream") setSeedreamSettings(p => ({ ...p, seed }));
      if (selectedModel === "flux") setFluxSettings(p => ({ ...p, seed }));
    }

    formData.append("settings", JSON.stringify(settings));

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Неизвестная ошибка API");
      }
      const data = await response.json();
      
      // <<< Обновляем состояния после генерации
      setResultUrl(data.imageUrl); // Показываем новый результат
      setResults(prev => [...prev, data.imageUrl]); // Добавляем его в галерею
      setTab("result");

    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Произошла неизвестная ошибка.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Возвращаем публичный API хука ---
  return {
    jsonContent,
    isJsonViewerOpen,
    setIsJsonViewerOpen,
    jsonError,
    onJsonFileChange,
    sourceFile,
    sourceUrl,
    resultUrl,
    prompt,
    setPrompt,
    rawPrompt,
    setRawPrompt,
    isRefining,
    refineError,
    sendImageToLlm,
    setSendImageToLlm,
    showRefiner,
    setShowRefiner,
     llmSettingsByModel,
    handleLlmSettingsChange,
    negativePrompt,
    setNegativePrompt,
    showNeg,
    setShowNeg,
    selectedModel,
    setSelectedModel,
    isLoading,
    error,
    imageInfo,
    tab,
    setTab,
    comparePos,
    setComparePos,
    seedLock,
    setSeedLock,
    qwenSettings,
    handleQwenChange,
    fluxSettings,
    handleFluxChange,
    seedreamSettings,
    handleSeedreamChange,
    dropRef,
    onKeyDown,
    onRefinePrompt,
    isReadyToGenerate,
    onFileChange,
    onDrop,
    onClear,
    onCancel,
    randomizeSeed,
    onGenerate,
    results,
    isDetailingMode,
    handleSelectResult,
    promptTokenCount,
    negativeTokenCount,
    seedreamTargetSize,
    setSeedreamTargetSize,
    seedreamSizeWarning,
  };
}
```

---

## Файл: `src/lib/types.ts`

```typescript
// src/lib/types.ts

export type Model = "gemini" | "qwen" | "flux" | "seedream";

export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export type QwenSettings = { guidance_scale: number; num_inference_steps: number; seed: number };
export type FluxSettings = { guidance_scale: number; safety_tolerance: number; seed: number };
export type SeedreamSettings = { 
  seed: number; 
  width: number; 
  height: number; 
};
export type LlmModel = 'gpt-5-mini' | 'gpt-5-nano';

export type LlmSettings = {
  model: LlmModel;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxCompletionTokens: number;
};

export type PersistState = {
  prompt: string;
  negativePrompt: string;
  selectedModel: Model;
  qwenSettings: QwenSettings;
  fluxSettings: FluxSettings;
  seedreamSettings: SeedreamSettings;
  llmSettingsByModel: { [key in Model]?: Partial<LlmSettings> };
  sendImageToLlm: boolean;
  showRefiner: boolean;
  showNeg: boolean;
  seedLock: boolean;
  tab: "source" | "result" | "compare";
  comparePos: number;
};
```

---

## Файл: `src/lib/utils.ts`

```typescript
// src/lib/utils.ts

import { PersistState } from "./types";

/**
 * Утилита для склейки CSS-классов.
 */
export function cx(...s: (string | false | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

/**
 * Читает размеры изображения из файла.
 */
export function readImageDims(file: File): Promise<{ w: number; h: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Загружает состояние из localStorage.
 */
export function loadPersist(): PersistState | null {
  try {
    const raw = localStorage.getItem("image_workspace_v2");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Сохраняет состояние в localStorage.
 */
export function savePersist(s: PersistState) {
  try {
    localStorage.setItem("image_workspace_v2", JSON.stringify(s));
  } catch {}
}
```

---

