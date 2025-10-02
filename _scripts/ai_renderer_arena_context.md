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
│   │   ├── cropper
│   │   │   └── UniversalCropper.tsx
│   │   ├── editor
│   │   │   ├── ArrowPointer.tsx
│   │   │   └── MultiArrowEditor.tsx
│   │   ├── sidebar
│   │   │   ├── ActionButtons.tsx
│   │   │   ├── BackgroundReplacer.tsx
│   │   │   ├── EnvironmentSettings.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── InstructionEditor.tsx
│   │   │   ├── JsonViewer.tsx
│   │   │   ├── MainPrompt.tsx
│   │   │   ├── ModeSwitcher.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── ModelSettings.tsx
│   │   │   ├── ObjectInjector.tsx
│   │   │   ├── ProTools.tsx
│   │   │   ├── PromptEngineer.tsx
│   │   │   ├── StyleTransplanter.tsx
│   │   │   └── TextureTransplanter.tsx
│   │   ├── ui
│   │   │   └── FormControls.tsx
│   │   └── workspace
│   │       ├── Canvas.tsx
│   │       ├── Sidebar.tsx
│   │       └── Sidebar.types.ts
│   ├── hooks
│   │   ├── useFileHandler.ts
│   │   ├── useImageWorkspace.ts
│   │   └── useSettingsManager.ts
│   └── lib
│       ├── api.ts
│       ├── constants.ts
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fal.run", // Оставляем на всякий случай
      },
      {
        protocol: "https",
        hostname: "v3.fal.media", // <<< ДОБАВЛЕНО: Явно разрешаем этот
      },
    ],
  },
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
```

---

## Файл: `src/app/api/refine-prompt/route.ts`

```typescript
// src/app/api/refine-prompt/route.ts
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
  } catch (err: unknown) { // <<< ИСПРАВЛЕНО
    console.error("refine-prompt error:", err);
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    return NextResponse.json(
      { error: message },
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
  const workspaceState = useImageWorkspace();

  // --- НОВАЯ ДИНАМИЧЕСКАЯ ЛОГИКА ---
  // Пропорции для PRO-режима (берутся из активной ноды)
  const proAspectRatio = workspaceState.activeNodeDims
    ? workspaceState.activeNodeDims.w / workspaceState.activeNodeDims.h
    : null;
  
  // Пропорции для BASE-режима (берутся из исходного скетча)
  const baseAspectRatio = workspaceState.imageInfo
    ? workspaceState.imageInfo.w / workspaceState.imageInfo.h
    : 16 / 9; // Запасной вариант

  // Выбираем, какие пропорции использовать, в зависимости от активной вкладки
  const sourceAspectRatio = workspaceState.activeTab === 'PRO' && proAspectRatio
    ? proAspectRatio
    : baseAspectRatio;
  // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6 focus:outline-none"
      onKeyDown={workspaceState.onKeyDown}
      tabIndex={-1}
    >
      {/* Передаем и весь стейт, и нашу новую вычисленную константу */}
      <Sidebar {...workspaceState} sourceAspectRatio={sourceAspectRatio} />

      <Canvas {...workspaceState} />
    </div>
  );
}
```

---

## Файл: `src/components/cropper/UniversalCropper.tsx`

```typescript
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Vec2 = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

type DragMode = 'none' | 'move' | 'resize-nw' | 'resize-ne' | 'resize-se' | 'resize-sw';

export type UniversalCropperProps = {
  imageSrc: string;
  aspectRatio: number;          // обязателен: width/height
  minWidth?: number;            // минимальная ширина рамки в CSS-пикселях
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
};

const HANDLE_SIZE_CSS = 12;
const HANDLE_HIT_CSS  = 20;

const dpr = () => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const UniversalCropper: React.FC<UniversalCropperProps> = ({
  imageSrc,
  aspectRatio,
  minWidth = 120,
  onConfirm,
  onCancel,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);

  // фон (fit) — масштаб и сдвиг
  const imgRef     = useRef<HTMLImageElement | null>(null);
  const [imgReady, setImgReady] = useState(false);
  const imgFitRef  = useRef<{ scale: number; x: number; y: number; w: number; h: number }>({
    scale: 1, x: 0, y: 0, w: 0, h: 0
  });

  // рамка
  const selRef     = useRef<Rect | null>(null);

  // drag state
  const dragRef = useRef<{
    mode: DragMode;
    start: Vec2;        // в backing px
    origSel: Rect;
  } | null>(null);

  // ===== загрузка изображения =====
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imgRef.current = img; setImgReady(true); };
    img.onerror = () => { imgRef.current = null; setImgReady(false); alert('Не удалось загрузить изображение'); };
    img.src = imageSrc;
    return () => { imgRef.current = null; setImgReady(false); };
  }, [imageSrc]);

  // ===== утилиты =====
  const pointInRect = (p: Vec2, r: Rect) =>
    p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

  const getCanvasPoint = (e: PointerEvent | React.PointerEvent): Vec2 => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const ratio  = dpr();
    return { x: (e.clientX - rect.left) * ratio, y: (e.clientY - rect.top) * ratio };
  };

  const handleHit = (p: Vec2): DragMode => {
    const sel = selRef.current!;
    const ratio = dpr();
    const hs   = HANDLE_HIT_CSS * ratio;
    const half = Math.round(hs / 2);

    const tests: { mode: DragMode; cx: number; cy: number }[] = [
      { mode: 'resize-nw', cx: sel.x,         cy: sel.y },
      { mode: 'resize-ne', cx: sel.x + sel.w, cy: sel.y },
      { mode: 'resize-se', cx: sel.x + sel.w, cy: sel.y + sel.h },
      { mode: 'resize-sw', cx: sel.x,         cy: sel.y + sel.h },
    ];

    for (const t of tests) {
      const r: Rect = { x: t.cx - half, y: t.cy - half, w: hs, h: hs };
      if (pointInRect(p, r)) return t.mode;
    }
    if (pointInRect(p, sel)) return 'move';
    return 'none';
  };

  const clampToImage = (r: Rect | null): Rect | null => {
    if (!r) return r;
    const fit = imgFitRef.current;
    let { x, y, w, h } = r;

    // не даём вылезти
    if (x < fit.x) x = fit.x;
    if (y < fit.y) y = fit.y;
    if (x + w > fit.x + fit.w) x = fit.x + fit.w - w;
    if (y + h > fit.y + fit.h) y = fit.y + fit.h - h;

    // если рамка больше изображения — ужмём
    if (w > fit.w) { w = fit.w; x = fit.x; h = Math.round(w / aspectRatio); }
    if (h > fit.h) { h = fit.h; y = fit.y; w = Math.round(h * aspectRatio); }

    // повторная подгонка на случай AR-сдвигов
    if (x < fit.x) x = fit.x;
    if (y < fit.y) y = fit.y;
    if (x + w > fit.x + fit.w) x = fit.x + fit.w - w;
    if (y + h > fit.y + fit.h) y = fit.y + fit.h - h;

    return { x, y, w, h };
  };

  // ===== ресайз canvas + fit-фото + первичная рамка =====
  const draw = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = dpr();
    const img = imgRef.current!;
    const fit = imgFitRef.current;
    const sel = selRef.current;

    // очистка
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // фон-фото (fit, статично)
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, img.width, img.height, fit.x, fit.y, fit.w, fit.h);

    if (!sel) return;

    // затемняем вне рамки
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.rect(sel.x, sel.y, sel.w, sel.h);
    ctx.fill('evenodd');
    ctx.restore();

    // обводка рамки
    ctx.save();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2 * ratio;
    ctx.setLineDash([6 * ratio, 4 * ratio]);
    ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
    ctx.setLineDash([]);

    // ручки (4 угла)
    const hs = HANDLE_SIZE_CSS * ratio;
    const half = Math.round(hs / 2);
    const corners: Vec2[] = [
      { x: sel.x,           y: sel.y           },
      { x: sel.x + sel.w,   y: sel.y           },
      { x: sel.x + sel.w,   y: sel.y + sel.h   },
      { x: sel.x,           y: sel.y + sel.h   },
    ];
    ctx.fillStyle = '#22d3ee';
    for (const c of corners) {
      ctx.fillRect(Math.round(c.x - half), Math.round(c.y - half), hs, hs);
    }
    ctx.restore();
  };

  const resizeAll = () => {
    const canvas  = canvasRef.current!;
    const wrapper = wrapperRef.current!;
    const ratio   = dpr();

    const rect = wrapper.getBoundingClientRect();
    // немного воздуха для кнопок
    const cssW = Math.max(320, rect.width);
    const cssH = Math.max(260, rect.height - 56);

    canvas.width  = Math.round(cssW * ratio);
    canvas.height = Math.round(cssH * ratio);
    canvas.style.width  = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const img = imgRef.current!;
    const s  = Math.min(canvas.width / img.width, canvas.height / img.height);
    const iw = Math.round(img.width * s);
    const ih = Math.round(img.height * s);
    const ix = Math.round((canvas.width  - iw) / 2);
    const iy = Math.round((canvas.height - ih) / 2);
    imgFitRef.current = { scale: s, x: ix, y: iy, w: iw, h: ih };

    // инициализируем рамку по центру (60% ширины fit-картинки)
    if (!selRef.current) {
      let w = Math.round(iw * 0.6);
      if (w < Math.round(minWidth * ratio)) w = Math.round(minWidth * ratio);
      let h = Math.round(w / aspectRatio);

      if (h > ih) {
        h = ih - Math.round(0.1 * ih);
        w = Math.round(h * aspectRatio);
      }
      const x = ix + Math.round((iw - w) / 2);
      const y = iy + Math.round((ih - h) / 2);
      selRef.current = { x, y, w, h };
    } else {
      selRef.current = clampToImage(selRef.current);
    }

    draw();
  };

  useLayoutEffect(() => {
    if (!imgReady) return;
    resizeAll();
    const onResize = () => { resizeAll(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgReady, aspectRatio, minWidth]);

  // ===== pointer handlers (React on* версии) =====
  const onPointerMoveCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sel = selRef.current;
    if (!sel) return;

    const p = getCanvasPoint(e);
    const canvas = canvasRef.current!;
    const ratio = dpr();

    if (!dragRef.current) {
      const m = handleHit(p);
      switch (m) {
        case 'move': canvas.style.cursor = 'move'; break;
        case 'resize-nw':
        case 'resize-se': canvas.style.cursor = 'nwse-resize'; break;
        case 'resize-ne':
        case 'resize-sw': canvas.style.cursor = 'nesw-resize'; break;
        default: canvas.style.cursor = 'default';
      }
      return;
    }

    const drag = dragRef.current!;
    const minW = Math.max(minWidth * ratio, 1);

    if (drag.mode === 'move') {
      const dx = p.x - drag.start.x;
      const dy = p.y - drag.start.y;
      const nx = drag.origSel.x + dx;
      const ny = drag.origSel.y + dy;
      selRef.current = clampToImage({ x: nx, y: ny, w: drag.origSel.w, h: drag.origSel.h });
      draw();
      return;
    }

    const signX = (drag.mode === 'resize-ne' || drag.mode === 'resize-se') ? 1 : -1;
    const signY = (drag.mode === 'resize-se' || drag.mode === 'resize-sw') ? 1 : -1;

    const dx = (p.x - drag.start.x) * signX;
    const dy = (p.y - drag.start.y) * signY;
    const base = Math.abs(dx) > Math.abs(dy) ? dx : dy;

    const w = Math.max(minW, drag.origSel.w + base * 2);
    const h = Math.round(w / aspectRatio);

    if (drag.mode === 'resize-nw') {
      const cx = drag.origSel.x + drag.origSel.w;
      const cy = drag.origSel.y + drag.origSel.h;
      const x = Math.round(cx - w);
      const y = Math.round(cy - h);
      selRef.current = clampToImage({ x, y, w, h });
    } else if (drag.mode === 'resize-ne') {
      const cx = drag.origSel.x;
      const cy = drag.origSel.y + drag.origSel.h;
      const x = Math.round(cx);
      const y = Math.round(cy - h);
      selRef.current = clampToImage({ x, y, w, h });
    } else if (drag.mode === 'resize-se') {
      const x = drag.origSel.x;
      const y = drag.origSel.y;
      selRef.current = clampToImage({ x, y, w, h });
    } else if (drag.mode === 'resize-sw') {
      const cx = drag.origSel.x + drag.origSel.w;
      const cy = drag.origSel.y;
      const x = Math.round(cx - w);
      const y = Math.round(cy);
      selRef.current = clampToImage({ x, y, w, h });
    }
    draw();
  };

  const onPointerDownCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selRef.current) return;
    (e.currentTarget as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
    const p = getCanvasPoint(e);
    const mode = handleHit(p);
    if (mode === 'none') return;
    dragRef.current = { mode, start: p, origSel: { ...selRef.current } };
  };

  const onPointerUpWindow = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'default';
    dragRef.current = null;
  };

  useEffect(() => {
    window.addEventListener('pointerup', onPointerUpWindow);
    return () => window.removeEventListener('pointerup', onPointerUpWindow);
  }, []);

  const onWheelCanvas = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const sel = selRef.current;
    if (!sel) return;

    const p = getCanvasPoint(e as unknown as PointerEvent);
    const fit = imgFitRef.current;
    if (!pointInRect(p, { x: fit.x, y: fit.y, w: fit.w, h: fit.h })) return;

    const ratio = dpr();
    const minW = Math.max(minWidth * ratio, 1);

    const zoomFactor = Math.exp((-e.deltaY) * 0.0008);
    const w = Math.max(minW, Math.round(sel.w * zoomFactor));
    const h = Math.round(w / aspectRatio);

    const relX = (p.x - sel.x) / sel.w;
    const relY = (p.y - sel.y) / sel.h;
    const x = Math.round(p.x - relX * w);
    const y = Math.round(p.y - relY * h);

    selRef.current = clampToImage({ x, y, w, h });
    draw();
  };

  // ===== экспорт =====
  const handleConfirm = useCallback(() => {
    const img = imgRef.current!;
    const sel = selRef.current!;
    const fit = imgFitRef.current;

    // перевод из canvas/backing в пиксели оригинала
    const s  = fit.scale;
    const sx = Math.round((sel.x - fit.x) / s);
    const sy = Math.round((sel.y - fit.y) / s);
    const sw = Math.round(sel.w / s);
    const sh = Math.round(sel.h / s);

    const csx = clamp(sx, 0, img.width);
    const csy = clamp(sy, 0, img.height);
    const csw = clamp(sw - (csx - sx), 1, img.width  - csx);
    const csh = clamp(sh - (csy - sy), 1, img.height - csy);

    const out = document.createElement('canvas');
    out.width  = csw;
    out.height = csh;
    const ctx = out.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, csx, csy, csw, csh, 0, 0, csw, csh);
    out.toBlob((b) => { if (b) onConfirm(b); }, 'image/png');
  }, [onConfirm]);

  // ===== клавиатура =====
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') handleConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, handleConfirm]);

  // ===== UI / Portal Logic =====
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Блокируем скролл фона, пока открыт кроппер
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const sizeText = useMemo(() => {
    const fit = imgFitRef.current;
    const sel = selRef.current;
    if (!sel || !fit.scale) return '';
    const w = Math.round(sel.w / fit.scale);
    const h = Math.round(sel.h / fit.scale);
    return `${w}×${h}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgReady]);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col p-4">
      {/* Фон — без перехвата событий */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden />

      {/* Интерактивный слой */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-slate-200 text-sm font-mono">
            AR: {aspectRatio.toFixed(3)} <span className="text-slate-500 mx-2">•</span> {sizeText}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition"
            >
              Cancel (Esc)
            </button>
            <button
              onClick={handleConfirm}
              className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 transition"
            >
              Confirm (Enter)
            </button>
          </div>
        </div>

        <div ref={wrapperRef} className="flex-1 min-h-[260px]">
          <div className="relative h-full w-full overflow-hidden rounded-md border border-slate-800 bg-slate-950/50">
            <canvas
              ref={canvasRef}
              className="block h-full w-full select-none"
              style={{ touchAction: 'none', pointerEvents: 'auto', cursor: 'default' }}
              onPointerDown={onPointerDownCanvas}
              onPointerMove={onPointerMoveCanvas}
              onWheel={onWheelCanvas}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

```

---

## Файл: `src/components/editor/ArrowPointer.tsx`

```typescript
import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Vec2 = { x: number; y: number };

// SVG-иконка жирной красной стрелки (встроенная).
const ArrowSvg = ({ rotation }: { rotation: number }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 150 90"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: `rotate(${rotation}deg)`,
      filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.7))',
      pointerEvents: 'none',
    }}
  >
    <path
      d="M50 0 L100 45 L70 45 L70 90 L30 90 L30 45 L0 45 Z"
      fill="#FF0000"
      stroke="#6D0000"
      strokeWidth="2.3"
    />
  </svg>
);

export const ArrowPointer: React.FC<{
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}> = ({ imageSrc, onConfirm, onCancel }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [arrowPos, setArrowPos] = useState<Vec2>({ x: 150, y: 150 });
  const [arrowSize, setArrowSize] = useState(100);
  const [arrowRotation, setArrowRotation] = useState(0);

  // Загружаем основное изображение
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => setImg(image);
  }, [imageSrc]);

  // Отрисовка: стабильная функция через useCallback
  const draw = useCallback(() => {
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Подгоняем CSS-размер под контейнер, но внутренний размер — нативный (качество)
    const parent = canvas.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    if (parentRect.width === 0 || parentRect.height === 0) return;

    const imgAspect = img.width / img.height;
    const parentAspect = parentRect.width / parentRect.height;

    let cssWidth: number;
    let cssHeight: number;

    if (imgAspect > parentAspect) {
      cssWidth = parentRect.width;
      cssHeight = parentRect.width / imgAspect;
    } else {
      cssHeight = parentRect.height;
      cssWidth = parentRect.height * imgAspect;
    }

    // Внутреннее разрешение = оригинал (чётко), CSS — под экран
    canvas.width = img.width;
    canvas.height = img.height;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [img]);

  // Первый рендер + resize на стабильную draw
  useLayoutEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  // Клавиатура: Escape = отмена
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // Подтверждение — соберём PNG с отрисованной стрелкой на полном разрешении
  const handleConfirm = () => {
    if (!img) return;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = img.width;
    offscreenCanvas.height = img.height;
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return;

    // 1) Бэкграунд: исходник
    ctx.drawImage(img, 0, 0);

    // 2) Стрелка (корректно масштабируем относительно внутреннего размера)
    const canvas = canvasRef.current!;
    const scaleFactor = img.width / canvas.width; // соотн. экран/оригинал

    ctx.save();
    // Центр стрелки в координатах исходника
    ctx.translate(arrowPos.x * scaleFactor, arrowPos.y * scaleFactor);
    ctx.rotate((arrowRotation * Math.PI) / 180);

    // viewBox 150x90 -> масштаб относительно ширины 150
    const arrowRenderSize = arrowSize * scaleFactor;
    const pathScale = arrowRenderSize / 150;
    ctx.scale(pathScale, pathScale);

    // Центр фигуры (75,45) — в (0,0)
    ctx.translate(-75, -45);

    // Стили
    ctx.fillStyle = '#FF0000';
    ctx.strokeStyle = '#6D0000';
    ctx.lineWidth = 2.3 / pathScale; // толщину сохраняем визуально
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;

    // Рисуем path
    const path = new Path2D('M50 0 L100 45 L70 45 L70 90 L30 90 L30 45 L0 45 Z');
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore();

    offscreenCanvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      'image/png',
      1
    );
  };

  // Модалка: фиксируем скролл
  useEffect(() => {
    setIsMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || 'auto';
    };
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col p-4 bg-black/80 backdrop-blur-sm">
      <div className="flex-shrink-0 mb-2 flex items-center justify-between gap-2">
        <p className="text-slate-200 text-sm">Перетащи стрелку, чтобы указать цель</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
          >
            Подтвердить
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative flex items-center justify-center">
        <canvas ref={canvasRef} className="max-w-full max-h-full block" />
        <div
          className="absolute cursor-move touch-none"
          style={{
            left: arrowPos.x,
            top: arrowPos.y,
            width: arrowSize,
            height: arrowSize,
            transform: 'translate(-50%, -50%)',
          }}
          onPointerDown={(e) => {
            const el = e.currentTarget;
            el.setPointerCapture(e.pointerId);

            const onMove = (me: PointerEvent) => {
              setArrowPos((p) => ({ x: p.x + me.movementX, y: p.y + me.movementY }));
            };

            const onUp = () => {
              el.onpointermove = null;
              el.onpointerup = null;
              el.releasePointerCapture(e.pointerId);
            };

            el.onpointermove = onMove;
            el.onpointerup = onUp;
          }}
        >
          <ArrowSvg rotation={arrowRotation} />
        </div>
      </div>

      <div className="flex-shrink-0 mt-2 flex items-center justify-center gap-4 bg-slate-900/50 p-2 rounded-lg">
        <label className="text-xs text-slate-300">
          Размер:{' '}
          <input
            type="range"
            min="30"
            max="300"
            value={arrowSize}
            onChange={(e) => setArrowSize(Number(e.target.value))}
            className="accent-cyan-500"
          />
        </label>
        <label className="text-xs text-slate-300">
          Поворот:{' '}
          <input
            type="range"
            min="0"
            max="359"
            value={arrowRotation}
            onChange={(e) => setArrowRotation(Number(e.target.value))}
            className="accent-cyan-500"
          />
        </label>
      </div>
    </div>,
    document.body
  );
};

```

---

## Файл: `src/components/editor/MultiArrowEditor.tsx`

```typescript
import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Тип для описания одной стрелки с инструкцией
type ArrowInstruction = {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  text: string;
};

const TOKEN_LIMIT_CHARS = 100; // ~20-25 токенов

// SVG-иконка. Та же, что и в ArrowPointer
const ArrowSvg = ({ rotation }: { rotation: number }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 150 90"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: `rotate(${rotation}deg)`,
      filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.7))',
      pointerEvents: 'none',
    }}
  >
    <path
      d="M50 0 L100 45 L70 45 L70 90 L30 90 L30 45 L0 45 Z"
      fill="#FF0000"
      stroke="#6D0000"
      strokeWidth="2.3"
    />
  </svg>
);

export const MultiArrowEditor: React.FC<{
  imageSrc: string;
  onConfirm: (imageBlob: Blob, instructionsText: string) => void;
  onCancel: () => void;
}> = ({ imageSrc, onConfirm, onCancel }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [arrows, setArrows] = useState<ArrowInstruction[]>([]);
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const selectedArrow = arrows.find((a) => a.id === selectedArrowId) || null;

  // --- Загрузка изображения ---
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => setImg(image);
  }, [imageSrc]);

  // --- Отрисовка: стабильная функция через useCallback ---
  const draw = useCallback(() => {
    if (!img || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    if (parentRect.width === 0 || parentRect.height === 0) return;

    const imgAspect = img.width / img.height;
    const parentAspect = parentRect.width / parentRect.height;

    let cssWidth: number;
    let cssHeight: number;

    if (imgAspect > parentAspect) {
      cssWidth = parentRect.width;
      cssHeight = parentRect.width / imgAspect;
    } else {
      cssHeight = parentRect.height;
      cssWidth = parentRect.height * imgAspect;
    }

    // Внутреннее разрешение = оригинал (качество), CSS — под экран
    canvas.width = img.width;
    canvas.height = img.height;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [img]);

  // Первый рендер и подписка на resize — на стабильную draw
  useLayoutEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  // Клавиатура: Escape = отмена
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // --- Управление стрелками ---
  const updateArrow = (id: string, updates: Partial<ArrowInstruction>) => {
    setArrows((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const addArrow = () => {
    if (arrows.length >= 5) return;

    const parent = canvasRef.current?.parentElement;
    const parentRect = parent?.getBoundingClientRect();
    const centerX = (parentRect?.width ?? 300) / 2;
    const centerY = (parentRect?.height ?? 300) / 2;

    const newArrow: ArrowInstruction = {
      id: `arrow_${Date.now()}`,
      x: centerX,
      y: centerY,
      size: 100,
      rotation: 0,
      text: '',
    };

    setArrows((prev) => [...prev, newArrow]);
    setSelectedArrowId(newArrow.id);
  };

  const deleteSelectedArrow = () => {
    if (!selectedArrowId) return;
    setArrows((prev) => prev.filter((a) => a.id !== selectedArrowId));
    setSelectedArrowId(null);
  };

  const handleTextChange = (id: string, newText: string) => {
    if (newText.length > TOKEN_LIMIT_CHARS) return;
    updateArrow(id, { text: newText });
  };

  // --- Drag-n-Drop ---
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const el = e.currentTarget as HTMLDivElement;
    el.setPointerCapture(e.pointerId);

    setSelectedArrowId(id);

    const targetRect = el.getBoundingClientRect();
    const parentRect = el.parentElement!.getBoundingClientRect();

    const xInParent = targetRect.left - parentRect.left;
    const yInParent = targetRect.top - parentRect.top;

    const offsetX = e.clientX - parentRect.left - xInParent;
    const offsetY = e.clientY - parentRect.top - yInParent;

    dragRef.current = { id, offsetX, offsetY };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const parentRect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const newX = e.clientX - parentRect.left - dragRef.current.offsetX;
    const newY = e.clientY - parentRect.top - dragRef.current.offsetY;

    updateArrow(dragRef.current.id, { x: newX, y: newY });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

  // --- Подтверждение: «запекаем» стрелки и текст в PNG ---
  const handleConfirm = () => {
    if (!img || !canvasRef.current) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = img.width;
    offscreen.height = img.height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    // фон
    ctx.drawImage(img, 0, 0);

    // scale факторы между экранным canvas и исходником
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = img.width / rect.width;
    const scaleY = img.height / rect.height;

    const instructions: string[] = [];

    arrows.forEach((arrow) => {
      if (arrow.text.trim()) instructions.push(arrow.text.trim());

      // экранные координаты → координаты исходника
      const realX = arrow.x * scaleX;
      const realY = arrow.y * scaleY;

      // size масштабируем по X (viewBox по ширине 150)
      const realSize = arrow.size * scaleX;

      // Стрелка
      ctx.save();
      ctx.translate(realX + realSize / 2, realY + realSize / 2);
      ctx.rotate((arrow.rotation * Math.PI) / 180);

      const pathScale = realSize / 150; // viewBox width = 150
      ctx.scale(pathScale, pathScale);
      ctx.translate(-75, -45); // центр фигуры (75,45) в (0,0)

      const path = new Path2D('M50 0 L100 45 L70 45 L70 90 L30 90 L30 45 L0 45 Z');
      ctx.fillStyle = '#FF0000';
      ctx.strokeStyle = '#6D0000';
      ctx.lineWidth = 2.3 / pathScale;
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;

      ctx.fill(path);
      ctx.stroke(path);
      ctx.restore();

      // Текст под стрелкой
      if (arrow.text.trim()) {
        ctx.save();
        // Размер шрифта — из экранных ~20px, но в координатах исходника
        const fontSize = Math.max(20 * scaleX, 18);
        ctx.font = `bold ${Math.round(fontSize)}px Arial`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = Math.max(2 * scaleX, 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = realX + realSize / 2;
        const textY = realY + realSize * 1.25;

        ctx.strokeText(arrow.text, textX, textY);
        ctx.fillText(arrow.text, textX, textY);
        ctx.restore();
      }
    });

    offscreen.toBlob(
      (blob) => {
        if (blob) onConfirm(blob, instructions.join(', '));
      },
      'image/png',
      1
    );
  };

  // Модалка: блокируем скролл body
  useEffect(() => {
    setIsMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || 'auto';
    };
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col p-4 bg-black/80 backdrop-blur-sm">
      {/* Верхняя панель */}
      <div className="flex-shrink-0 mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <p className="text-slate-200 text-sm">Расставьте до 5 указателей с инструкциями</p>
          <button
            onClick={addArrow}
            disabled={arrows.length >= 5}
            className="rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 disabled:bg-gray-800 disabled:text-gray-500"
          >
            + Добавить стрелку ({arrows.length}/5)
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
          >
            Подтвердить
          </button>
        </div>
      </div>

      {/* Рабочая область */}
      <div
        className="flex-1 min-h-0 relative"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas ref={canvasRef} className="max-w-full max-h-full block" />
          {arrows.map((arrow) => (
            <div
              key={arrow.id}
              className="absolute touch-none"
              style={{
                left: arrow.x,
                top: arrow.y,
                width: arrow.size,
                height: arrow.size,
                border: selectedArrowId === arrow.id ? '2px dashed #06b6d4' : 'none',
                borderRadius: '4px',
                cursor: 'move',
                transform: `translate(-50%, -50%)`,
              }}
              onPointerDown={(e) => onPointerDown(e, arrow.id)}
            >
              <div style={{ width: arrow.size, height: arrow.size }}>
                <ArrowSvg rotation={arrow.rotation} />
                <textarea
                  value={arrow.text}
                  onChange={(e) => handleTextChange(arrow.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  placeholder="Инструкция..."
                  maxLength={TOKEN_LIMIT_CHARS}
                  className="absolute top-[105%] left-1/2 -translate-x-1/2 w-[120%] min-h-[40px] p-1 text-center bg-black/60 text-white text-xs rounded-md border border-cyan-500/50 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="flex-shrink-0 mt-2 h-16 flex items-center justify-center gap-6 bg-slate-900/50 p-2 rounded-lg">
        {selectedArrow ? (
          <>
            <label className="text-xs text-slate-300">
              Размер:{' '}
              <input
                type="range"
                min="30"
                max="300"
                value={selectedArrow.size}
                onChange={(e) => updateArrow(selectedArrow.id, { size: Number(e.target.value) })}
                className="w-32 accent-cyan-500"
              />
            </label>
            <label className="text-xs text-slate-300">
              Поворот:{' '}
              <input
                type="range"
                min="0"
                max="359"
                value={selectedArrow.rotation}
                onChange={(e) =>
                  updateArrow(selectedArrow.id, { rotation: Number(e.target.value) })
                }
                className="w-32 accent-cyan-500"
              />
            </label>
            <button
              onClick={deleteSelectedArrow}
              className="rounded bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Удалить
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-500">Выберите стрелку, чтобы изменить её</p>
        )}
      </div>
    </div>,
    document.body
  );
};

```

---

## Файл: `src/components/sidebar/ActionButtons.tsx`

```typescript
// src/components/sidebar/ActionButtons.tsx
import React from 'react';
import { cx } from '@/lib/utils';

interface ActionButtonsProps {
  isReadyToGenerate: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onCancel: () => void;
  onClear: () => void;
  error: string | null;
  activeTab: 'BASE' | 'PRO';
  sourceFile: File | null;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isReadyToGenerate,
  isLoading,
  onGenerate,
  onCancel,
  onClear,
  error,
  activeTab,
  sourceFile,
}) => {
  return (
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
        {isLoading ? "Обработка..." : (activeTab === 'BASE' ? "Сгенерировать" : "Доработать")}
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
  );
};
```

---

## Файл: `src/components/sidebar/BackgroundReplacer.tsx`

```typescript
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { cx } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/lib/types';
import { Label } from '../ui/FormControls';
import { UniversalCropper } from '@/components/cropper/UniversalCropper';

type ModelForBg = 'gemini' | 'seedream';

interface BackgroundReplacerProps {
  onGenerate: (
    referenceFile: File,
    targets: { window: boolean; door: boolean },
    model: ModelForBg
  ) => void;
  isLoading: boolean;
  // ВАЖНО: Нам нужно знать пропорции исходной сауны, чтобы заблокировать кроппер
  sourceAspectRatio: number;
}

export const BackgroundReplacer: React.FC<BackgroundReplacerProps> = ({
  onGenerate,
  isLoading,
  sourceAspectRatio,
}) => {
  // Этот стейт теперь хранит ГОТОВЫЙ, ОБРЕЗАННЫЙ файл
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targets, setTargets] = useState({ window: true, door: false });
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelForBg>('gemini');

  // Этот стейт открывает/закрывает кроппер и хранит URL сырого файла
  const [cropRequest, setCropRequest] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReady = referenceFile && (targets.window || targets.door) && !isLoading;

  // Шаг 1: Пользователь выбирает файл, мы открываем кроппер
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Неверный тип файла. Нужен PNG, JPEG или WebP.');
      return;
    }
    setError(null);

    // Создаем временный URL и отправляем его в стейт, чтобы открыть модалку кроппера
    const url = URL.createObjectURL(file);
    setCropRequest(url);
  };

  // Шаг 2: Кроппер закончил работу, мы получаем готовый Blob
  const handleCropConfirm = (croppedBlob: Blob) => {
    // Чистим URL и закрываем кроппер
    if (cropRequest) {
      URL.revokeObjectURL(cropRequest);
    }
    setCropRequest(null);

    // Превращаем Blob в File, с которым будет работать остальное приложение
    const croppedFile = new File([croppedBlob], "background_crop.png", { type: "image/png" });
    setReferenceFile(croppedFile);
    // Сбрасываем значение инпута, чтобы можно было загрузить тот же файл еще раз
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  // Шаг 2.1: Пользователь отменил кроп
  const handleCropCancel = () => {
    if (cropRequest) {
      URL.revokeObjectURL(cropRequest);
    }
    setCropRequest(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  // Этот хук теперь работает с уже обрезанным файлом для маленького превью
  useEffect(() => {
    if (!referenceFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(referenceFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [referenceFile]);

  const handleSubmit = () => {
    if (!isReady || !referenceFile) return;
    onGenerate(referenceFile, targets, selectedModel);
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleTargetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTargets(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок загрузки */}
            <div>
            <Label title="Референс фона" />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={ACCEPTED_FILE_TYPES.join(',')}
                className="hidden"
            />
            <button
                type="button"
                onClick={handleButtonClick}
                className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            >
                {previewUrl ? 'Заменить фон' : '+ Загрузить фон'}
            </button>

            {/* Новый блок предпросмотра, который появляется после загрузки */}
            {previewUrl && (
                <div className="mt-3 relative h-20 w-full flex items-center justify-center rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={previewUrl}
                alt="Reference preview"
                className="h-full w-auto object-contain"
            />
                </div>
            )}

            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>

        {/* Блок выбора модели */}
        <div>
          <Label title="Модель" />
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
            {(['gemini', 'seedream'] as ModelForBg[]).map(model => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={cx(
                  "py-1.5 rounded-md text-xs font-semibold transition-colors",
                  selectedModel === model
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                )}
              >
                {model === 'gemini' ? 'Nano Banana' : 'SeeDream'}
              </button>
            ))}
          </div>
        </div>

        {/* Блок выбора целей */}
        <div>
          <Label title="Цели для замены" />
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-gray-800 transition">
              <input
                type="checkbox" name="window" checked={targets.window} onChange={handleTargetChange}
                className="accent-cyan-500 w-4 h-4"
              />
              Окна
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-gray-800 transition">
              <input
                type="checkbox" name="door" checked={targets.door} onChange={handleTargetChange}
                className="accent-cyan-500 w-4 h-4"
              />
              Дверь
            </label>
          </div>
        </div>

        {/* Кнопка действия */}
        <button
          onClick={handleSubmit}
          disabled={!isReady}
          className={cx(
            "w-full text-sm font-semibold py-2.5 rounded-lg transition",
            isReady
              ? "bg-cyan-600 hover:bg-cyan-500 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? "Обработка..." : "Заменить фон"}
        </button>
      </div>

      {/* Модальное окно с кроппером, которое рендерится только когда нужно */}
      {cropRequest && (
        <UniversalCropper
          imageSrc={cropRequest}
          aspectRatio={sourceAspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          // Можно добавить кастомные тексты, если наш UniversalCropper их поддерживает
          // title="Обрежьте фон под пропорции сауны"
          // confirmButtonText="Применить фон"
        />
      )}
    </>
  );
};
```

---

## Файл: `src/components/sidebar/EnvironmentSettings.tsx`

```typescript
// src/components/sidebar/EnvironmentSettings.tsx
import React, { ChangeEvent } from "react";
import { Label } from "@/components/ui/FormControls";

interface EnvironmentSettingsProps {
  windowView: string;
  setWindowView: (value: string) => void;
  doorView: string;
  setDoorView: (value: string) => void;
}

const windowTemplates = [
  { label: 'Лес летний', value: 'a lush green summer forest with sunbeams filtering through the leaves' },
  { label: 'Лес зимний', value: 'a quiet, snow-covered winter forest with tall pine trees' },
  { label: 'Горы (Альпы)', value: 'a majestic view of the snow-capped Alpine mountains under a clear blue sky' },
  { label: 'Двор летний', value: 'a neat suburban backyard in summer with a manicured green lawn and a wooden fence' },
  { label: 'Двор зимний', value: 'a suburban backyard in winter, covered in a fresh blanket of snow' },
];

const doorTemplates = [
  { label: 'Предбанник', value: 'a cozy antechamber (changing room) with wooden benches' },
  { label: 'Современный коридор', value: 'a modern, minimalist hallway with soft lighting' },
  { label: 'Раздевалка', value: 'a clean, bright locker room with wooden cabinets' },
  { label: 'Другая комната', value: 'another sauna room, slightly out of focus' },
];

export const EnvironmentSettings: React.FC<EnvironmentSettingsProps> = ({
  windowView,
  setWindowView,
  doorView,
  setDoorView,
}) => {
  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>, setter: (val: string) => void) => {
    const value = e.target.value;
    // Если выбрана опция с value, используем ее. Если выбрана "Шаблоны...", то value будет пустой строкой, и ничего не произойдет.
    if (value) {
      setter(value);
    }
  };

  return (
    <div className="mt-5 space-y-4 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
      <h3 className="text-sm font-medium text-gray-200">Настройка окружения</h3>

      {/* Window View */}
      <div>
        <Label title="Вид из окна" />
        <div className="flex gap-2">
          <select
            onChange={(e) => handleTemplateChange(e, setWindowView)}
            className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Шаблоны...</option>
            {windowTemplates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            value={windowView}
            onChange={(e) => setWindowView(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="... или впиши свой вариант"
          />
        </div>
      </div>

      {/* Door View */}
      <div>
        <Label title="Вид за дверью" />
        <div className="flex gap-2">
          <select
            onChange={(e) => handleTemplateChange(e, setDoorView)}
            className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Шаблоны...</option>
            {doorTemplates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            value={doorView}
            onChange={(e) => setDoorView(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="... или впиши свой вариант"
          />
        </div>
      </div>
    </div>
  );
};
```

---

## Файл: `src/components/sidebar/FileUpload.tsx`

```typescript
// src/components/sidebar/FileUpload.tsx
import React, { ChangeEvent, DragEvent, RefObject } from "react";
import { cx } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from "@/lib/types";
import { Label } from "@/components/ui/FormControls";

interface FileUploadProps {
  imageInfo: { w: number; h: number } | null;
  sourceFile: File | null;
  dropRef: RefObject<HTMLLabelElement | null>;
  onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  imageInfo,
  sourceFile,
  dropRef,
  onDrop,
  onFileChange,
}) => {
  return (
    <div className="space-y-2">
      <Label
        title={"Исходное изображение (скетч)"}
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
              {ACCEPTED_FILE_TYPES.map(t => t.replace('image/', '')).join(', ').toUpperCase()} • до {MAX_FILE_SIZE_MB}MB • Ctrl+V
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
  );
};
```

---

## Файл: `src/components/sidebar/InstructionEditor.tsx`

```typescript
// src/components/sidebar/InstructionEditor.tsx
import React from 'react';

import { MainPrompt } from './MainPrompt';
import { ModelSelector } from './ModelSelector';
import { ModelSettings } from './ModelSettings';
import { ActionButtons } from './ActionButtons';
import type { SidebarProps } from '../workspace/Sidebar.types';

// Мы берем часть пропсов из общего типа, чтобы не дублировать
type InstructionEditorProps = Pick<
  SidebarProps,
  | 'activeTab'
  | 'prompt'
  | 'setPrompt'
  | 'promptTokenCount'
  | 'showNeg'
  | 'setShowNeg'
  | 'negativePrompt'
  | 'setNegativePrompt'
  | 'negativeTokenCount'
  | 'selectedModel'
  | 'setSelectedModel'
  | 'seedLock'
  | 'setSeedLock'
  | 'randomizeSeed'
  | 'qwenSettings'
  | 'handleQwenChange'
  | 'fluxSettings'
  | 'handleFluxChange'
  | 'seedreamSettings'
  | 'handleSeedreamChange'
  | 'seedreamTargetSize'
  | 'setSeedreamTargetSize'
  | 'seedreamSizeWarning'
  | 'isReadyToGenerate'
  | 'isLoading'
  | 'onGenerate'
  | 'onCancel'
  | 'onClear'
  | 'error'
  | 'sourceFile'
>;

export const InstructionEditor: React.FC<InstructionEditorProps> = (props) => {
  return (
    <div className="space-y-5 pt-3">
      {/* Здесь мы просто переиспользуем те же самые компоненты,
        которые раньше были разбросаны по сайдбару.
        Теперь они живут вместе, как хорошая семья.
      */}
      <MainPrompt
        activeTab={props.activeTab}
        prompt={props.prompt}
        setPrompt={props.setPrompt}
        promptTokenCount={props.promptTokenCount}
        showNeg={props.showNeg}
        setShowNeg={props.setShowNeg}
        negativePrompt={props.negativePrompt}
        setNegativePrompt={props.setNegativePrompt}
        negativeTokenCount={props.negativeTokenCount}
      />

      <ModelSelector
        selectedModel={props.selectedModel}
        setSelectedModel={props.setSelectedModel}
      />

      <ModelSettings
        selectedModel={props.selectedModel}
        seedLock={props.seedLock}
        setSeedLock={props.setSeedLock}
        randomizeSeed={props.randomizeSeed}
        qwenSettings={props.qwenSettings}
        handleQwenChange={props.handleQwenChange}
        fluxSettings={props.fluxSettings}
        handleFluxChange={props.handleFluxChange}
        seedreamSettings={props.seedreamSettings}
        handleSeedreamChange={props.handleSeedreamChange}
        seedreamTargetSize={props.seedreamTargetSize}
        setSeedreamTargetSize={props.setSeedreamTargetSize}
        seedreamSizeWarning={props.seedreamSizeWarning}
      />

      <ActionButtons
        isReadyToGenerate={props.isReadyToGenerate}
        isLoading={props.isLoading}
        onGenerate={props.onGenerate}
        onCancel={props.onCancel}
        onClear={props.onClear}
        error={props.error}
        activeTab={props.activeTab}
        sourceFile={props.sourceFile}
      />
    </div>
  );
};
```

---

## Файл: `src/components/sidebar/JsonViewer.tsx`

```typescript
// src/components/sidebar/JsonViewer.tsx
import React, { ChangeEvent } from "react";

interface JsonViewerProps {
  isJsonViewerOpen: boolean;
  setIsJsonViewerOpen: (value: React.SetStateAction<boolean>) => void;
  onJsonFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  jsonError: string | null;
  jsonContent: string | null;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  isJsonViewerOpen,
  setIsJsonViewerOpen,
  onJsonFileChange,
  jsonError,
  jsonContent,
}) => {
  return (
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
  );
};
```

---

## Файл: `src/components/sidebar/MainPrompt.tsx`

```typescript
// src/components/sidebar/MainPrompt.tsx
import React from 'react';
import { Label } from '@/components/ui/FormControls';

interface MainPromptProps {
  activeTab: 'BASE' | 'PRO';
  prompt: string;
  setPrompt: (value: string) => void;
  promptTokenCount: number;
  showNeg: boolean;
  setShowNeg: (value: React.SetStateAction<boolean>) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  negativeTokenCount: number;
}

export const MainPrompt: React.FC<MainPromptProps> = ({
  activeTab,
  prompt,
  setPrompt,
  promptTokenCount,
  showNeg,
  setShowNeg,
  negativePrompt,
  setNegativePrompt,
  negativeTokenCount,
}) => {
  return (
    <div className="mt-5 space-y-2">
      <Label
        title={activeTab === 'BASE' ? "Инструкция для генерации" : "Опишите правку"}
        right={
          <span className="text-[10px] text-gray-500">
            Токены: {promptTokenCount}
          </span>
        }
      />
      <textarea
        rows={5}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder={activeTab === 'BASE' ? "Создай фотореалистичную сауну..." : "Например: сделай эту стену из темного камня"}
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
  );
};
```

---

## Файл: `src/components/sidebar/ModelSelector.tsx`

```typescript
// src/components/sidebar/ModelSelector.tsx
import React from 'react';
import { cx } from '@/lib/utils';
import { Model } from '@/lib/types';

interface ModelSelectorProps {
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
}

const MODELS: Model[] = ["flux", "qwen", "seedream", "gemini"];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, setSelectedModel }) => {
  return (
    <div className="mt-5 space-y-2">
      <h3 className="text-xs text-gray-300 mb-1.5">Модель</h3>
      <div className="grid grid-cols-4 gap-2">
        {MODELS.map((m) => {
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
  );
};
```

---

## Файл: `src/components/sidebar/ModelSettings.tsx`

```typescript
// src/components/sidebar/ModelSettings.tsx
import React, { ChangeEvent } from 'react';
import { Model, QwenSettings, FluxSettings, SeedreamSettings } from '@/lib/types';
import { Label, Slider } from '@/components/ui/FormControls';
import { cx } from '@/lib/utils';

interface ModelSettingsProps {
  selectedModel: Model;
  seedLock: boolean;
  setSeedLock: (value: boolean) => void;
  randomizeSeed: () => void;
  qwenSettings: QwenSettings;
  handleQwenChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fluxSettings: FluxSettings;
  handleFluxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  seedreamSettings: SeedreamSettings;
  handleSeedreamChange: (e: ChangeEvent<HTMLInputElement>) => void;
  seedreamTargetSize: 1024 | 1280 | 'original';
  setSeedreamTargetSize: (size: 1024 | 1280 | 'original') => void;
  seedreamSizeWarning: string | null;
}

export const ModelSettings: React.FC<ModelSettingsProps> = ({
  selectedModel,
  seedLock,
  setSeedLock,
  randomizeSeed,
  qwenSettings,
  handleQwenChange,
  fluxSettings,
  handleFluxChange,
  seedreamSettings,
  handleSeedreamChange,
  seedreamTargetSize,
  setSeedreamTargetSize,
  seedreamSizeWarning,
}) => {
  return (
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
            value={qwenSettings?.guidance_scale ?? 4}
            min={1}
            max={10}
            step={0.1}
            onChange={handleQwenChange}
            name="guidance_scale"
          />
          <Slider
            label="Inference Steps"
            value={qwenSettings?.num_inference_steps ?? 30}
            min={10}
            max={60}
            step={1}
            onChange={handleQwenChange}
            name="num_inference_steps"
          />
          <Slider
            label="Seed"
            value={qwenSettings?.seed ?? 0}
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
            value={fluxSettings?.guidance_scale ?? 3.5}
            min={0}
            max={10}
            step={0.1}
            onChange={handleFluxChange}
            name="guidance_scale"
          />
          <Slider
            label="Safety Tolerance"
            value={fluxSettings?.safety_tolerance ?? 2}
            min={0}
            max={10}
            step={0.5}
            onChange={handleFluxChange}
            name="safety_tolerance"
            info="Большее — строже safety и потенциальный кроп."
          />
          <Slider
            label="Seed"
            value={fluxSettings?.seed ?? 0}
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
          {seedreamSizeWarning && (
            <p className="text-[11px] text-yellow-300 bg-yellow-900/40 border border-yellow-800/50 p-2 rounded-md mt-2">
              {seedreamSizeWarning}
            </p>
          )}

          <Slider
            label="Seed"
            value={seedreamSettings?.seed ?? 0}
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
  );
};
```

---

## Файл: `src/components/sidebar/ModeSwitcher.tsx`

```typescript
// src/components/sidebar/ModeSwitcher.tsx
import React from 'react';
import { cx } from '@/lib/utils';

interface ModeSwitcherProps {
  activeTab: 'BASE' | 'PRO';
  handleTabChange: (tab: 'BASE' | 'PRO') => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ activeTab, handleTabChange }) => {
  return (
    <div className="mb-5 bg-gray-900 border border-gray-800 rounded-lg p-1 flex">
      <button
        onClick={() => handleTabChange('BASE')}
        className={cx(
          "w-1/2 px-3 py-1.5 text-xs rounded-md font-semibold transition-colors",
          activeTab === 'BASE'
            ? "bg-gray-700 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        )}
      >
        Стартовая площадка
      </button>
      <button
        onClick={() => handleTabChange('PRO')}
        className={cx(
          "w-1/2 px-3 py-1.5 text-xs rounded-md font-semibold transition-colors",
          activeTab === 'PRO'
            ? "bg-cyan-600 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        )}
      >
        Мастерская (PRO)
      </button>
    </div>
  );
};
```

---

## Файл: `src/components/sidebar/ObjectInjector.tsx`

```typescript
// src/components/sidebar/ObjectInjector.tsx
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { cx } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/lib/types';
import { Label } from '../ui/FormControls';
import { ArrowPointer } from '../editor/ArrowPointer';
import { UniversalCropper } from '../cropper/UniversalCropper';

interface ObjectInjectorProps {
  onGenerate: (targetMapFile: File, objectFile: File, model: 'gemini' | 'seedream') => void;
  isLoading: boolean;
  activeImageUrl: string | null;
  sourceAspectRatio: number;
}

export const ObjectInjector: React.FC<ObjectInjectorProps> = ({
  onGenerate,
  isLoading,
  activeImageUrl,
  sourceAspectRatio,
}) => {
  const [objectFile, setObjectFile] = useState<File | null>(null);
  const [objectPreview, setObjectPreview] = useState<string | null>(null);
  const [targetMapFile, setTargetMapFile] = useState<File | null>(null);
  const [targetMapPreview, setTargetMapPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isPointerEditorOpen, setIsPointerEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropRequest, setCropRequest] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'seedream'>('gemini');

  const isReady = objectFile && targetMapFile && !isLoading;

  useEffect(() => {
    setObjectFile(null);
    setTargetMapFile(null);
  }, [activeImageUrl]);

  useEffect(() => {
    if (!objectFile) {
      setObjectPreview(null);
      return;
    }
    const url = URL.createObjectURL(objectFile);
    setObjectPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [objectFile]);

  useEffect(() => {
    if (!targetMapFile) {
      setTargetMapPreview(null);
      return;
    }
    const url = URL.createObjectURL(targetMapFile);
    setTargetMapPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [targetMapFile]);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Неверный тип файла. Нужен PNG, JPEG или WebP.');
      return;
    }
    setError(null);
    
    const url = URL.createObjectURL(file);
    setCropRequest(url);
  };

  const handleCropConfirm = (croppedBlob: Blob) => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);

    const croppedFile = new File([croppedBlob], "object_crop.png", { type: "image/png" });
    setObjectFile(croppedFile);
  };

  const handleCropCancel = () => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);
  };
  
  const handlePointerConfirm = (blob: Blob) => {
    const file = new File([blob], 'target_map.png', { type: 'image/png' });
    setTargetMapFile(file);
    setIsPointerEditorOpen(false);
  };

  const handleSubmit = () => {
    if (!isReady || !targetMapFile || !objectFile) return;
    onGenerate(targetMapFile, objectFile, selectedModel);
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок 1: Загрузка Объекта */}
        <div>
          <Label title="1. Загрузите объект" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ACCEPTED_FILE_TYPES.join(',')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            {objectPreview ? 'Заменить объект' : '+ Выбрать объект'}
          </button>
          {objectPreview && (
            <div className="mt-3 relative h-20 w-full rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
              <img src={objectPreview} alt="Object preview" className="h-full w-full object-contain" />
            </div>
          )}
        </div>

        {/* Блок 2: Указание Цели */}
        <div>
          <Label title="2. Укажите место на фото" />
          <button
            type="button"
            onClick={() => setIsPointerEditorOpen(true)}
            disabled={!activeImageUrl}
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {targetMapPreview ? 'Изменить указатель' : '🎯 Поставить указатель'}
          </button>
           {targetMapPreview && (
            <div className="mt-3 relative h-20 w-full rounded-lg border border-cyan-700 bg-gray-950 overflow-hidden">
              <img src={targetMapPreview} alt="Target map preview" className="h-full w-auto mx-auto object-contain" />
            </div>
          )}
        </div>
        
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

        {/* Блок Выбора Модели */}
        <div>
          <Label title="Модель" />
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
            {(['gemini', 'seedream'] as const).map(model => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={cx(
                  "py-1.5 rounded-md text-xs font-semibold transition-colors",
                  selectedModel === model
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                )}
              >
                {model === 'gemini' ? 'Nano Banana' : 'SeeDream'}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка действия */}
        <button
          onClick={handleSubmit}
          disabled={!isReady}
          className={cx(
            "w-full text-sm font-semibold py-2.5 rounded-lg transition",
            isReady
              ? "bg-cyan-600 hover:bg-cyan-500 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? "Обработка..." : "Внедрить Объект"}
        </button>
      </div>

      {isPointerEditorOpen && activeImageUrl && (
        <ArrowPointer
          imageSrc={activeImageUrl}
          onConfirm={handlePointerConfirm}
          onCancel={() => setIsPointerEditorOpen(false)}
        />
      )}

      {cropRequest && (
        <UniversalCropper
          imageSrc={cropRequest}
          aspectRatio={sourceAspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};
```

---

## Файл: `src/components/sidebar/PromptEngineer.tsx`

```typescript
// src/components/sidebar/PromptEngineer.tsx
import React, { ChangeEvent } from "react";
import { Label, Slider } from "@/components/ui/FormControls";
import { LlmSettings, Model } from "@/lib/types";

interface PromptEngineerProps {
  showRefiner: boolean;
  setShowRefiner: (value: React.SetStateAction<boolean>) => void;
  rawPrompt: string;
  setRawPrompt: (value: string) => void;
  llmSettingsByModel: { [key in Model]?: Partial<LlmSettings> };
  selectedModel: Model;
  handleLlmSettingsChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  sendImageToLlm: boolean;
  setSendImageToLlm: (value: boolean) => void;
  sourceFile: File | null;
  onRefinePrompt: () => void;
  isRefining: boolean;
  refineError: string | null;
}

export const PromptEngineer: React.FC<PromptEngineerProps> = ({
  showRefiner,
  setShowRefiner,
  rawPrompt,
  setRawPrompt,
  llmSettingsByModel,
  selectedModel,
  handleLlmSettingsChange,
  sendImageToLlm,
  setSendImageToLlm,
  sourceFile,
  onRefinePrompt,
  isRefining,
  refineError,
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
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      handleLlmSettingsChange({ target: { name: 'model', value: model } } as any);
                    }}
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
  );
};
```

---

## Файл: `src/components/sidebar/ProTools.tsx`

```typescript
// src/components/sidebar/ProTools.tsx
import React, { useState, useEffect } from 'react';
import type { SidebarProps } from '../workspace/Sidebar.types';

import { InstructionEditor } from './InstructionEditor';
import { TextureTransplanter } from './TextureTransplanter';
import { BackgroundReplacer } from './BackgroundReplacer';
import { StyleTransplanter } from './StyleTransplanter';
import { ObjectInjector } from './ObjectInjector';

import { MultiArrowEditor } from '../editor/MultiArrowEditor';
import { Label } from '../ui/FormControls';
import { cx } from '@/lib/utils';

type ProToolsProps = Omit<SidebarProps, 'handleTabChange'> & {
  onGenerateBackgroundReplacement: (
    file: File,
    targets: { window: boolean; door: boolean },
    model: 'gemini' | 'seedream'
  ) => void;
  onGenerateTextureReplacement: (
    targetMapFile: File,
    textureFile: File,
    model: 'gemini' | 'seedream'
  ) => void;
  onGenerateStyleReplacement: (
    file: File,
    model: 'gemini' | 'seedream'
  ) => void;
  onGenerateObjectInjection: (
    targetMapFile: File,
    objectFile: File,
    model: 'gemini' | 'seedream'
  ) => void;
  onGenerateArrowEdits: (
    imageBlob: Blob,
    instructionsText: string,
    model: 'gemini' | 'seedream'
  ) => void;
  sourceAspectRatio: number;
};

export const ProTools: React.FC<ProToolsProps> = (props) => {
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isBgReplacerOpen, setIsBgReplacerOpen] = useState(false);
  const [isTextureTransplanterOpen, setIsTextureTransplanterOpen] = useState(false);
  const [isStyleTransplanterOpen, setIsStyleTransplanterOpen] = useState(false);
  const [isObjectInjectorOpen, setIsObjectInjectorOpen] = useState(false);

  const [isArrowEditorOpen, setIsArrowEditorOpen] = useState(false);
  const [arrowEditorModel, setArrowEditorModel] = useState<'gemini' | 'seedream'>('seedream');

  // предпросмотр карты стрелок
  const [arrowMapBlob, setArrowMapBlob] = useState<Blob | null>(null);
  const [arrowMapPreviewUrl, setArrowMapPreviewUrl] = useState<string | null>(null);
  const [arrowInstructions, setArrowInstructions] = useState<string>('');

  // сброс при смене активного узла
  useEffect(() => {
    setArrowMapBlob(null);
    if (arrowMapPreviewUrl) URL.revokeObjectURL(arrowMapPreviewUrl);
    setArrowMapPreviewUrl(null);
    setArrowInstructions('');
  }, [props.activeNode?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // очистка URL при размонтировании/смене превью
  useEffect(() => {
    return () => {
      if (arrowMapPreviewUrl) URL.revokeObjectURL(arrowMapPreviewUrl);
    };
  }, [arrowMapPreviewUrl]);

  // получаем из редактора blob + текст
  const handleArrowEditorConfirm = (imageBlob: Blob, instructionsText: string) => {
    setArrowMapBlob(imageBlob);
    setArrowInstructions(instructionsText);
    if (arrowMapPreviewUrl) URL.revokeObjectURL(arrowMapPreviewUrl);
    setArrowMapPreviewUrl(URL.createObjectURL(imageBlob));
    setIsArrowEditorOpen(false);
  };

  // отправка в API
  const handleSendArrowEdits = () => {
    // ЛОВУШКА №1: Проверяем, что клик вообще сработал.
    console.log('--- [ProTools] Клик по "Отправить" зафиксирован. ---');

    // ЛОВУШКА №2: Смотрим, что у нас в руках перед выстрелом.
    console.log('--- [ProTools] Проверяем данные:', { arrowMapBlob, arrowInstructions });

    if (!arrowMapBlob || !arrowInstructions) {
      // ЛОВУШКА №3: Если мы остановились, то почему.
      console.error('--- [ProTools] ОСТАНОВКА: Нет картинки (blob) или текста инструкций!');
      return;
    }
    
    console.log('--- [ProTools] Все ок, передаем управление в useImageWorkspace... ---');
    props.onGenerateArrowEdits(arrowMapBlob, arrowInstructions, arrowEditorModel);
  };

  return (
    <div className="space-y-3">
      {props.activeHistory.length > 0 && (
        <div className="mb-2">
          <button
            onClick={props.handleChangeSource}
            className="w-full text-center text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-800/50 bg-yellow-900/20 rounded-md py-2 transition"
          >
            ↩︎ Сменить исходник
          </button>
        </div>
      )}

      <h3 className="text-sm font-semibold text-gray-200">PRO-инструменты</h3>

      <div className="space-y-2">
        {/* Правка по инструкции */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsEditorOpen((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400 p-3"
          >
            {isEditorOpen ? '▼' : '►'} Правка по инструкции
          </button>
          {isEditorOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <InstructionEditor {...props} />
            </div>
          )}
        </div>

        {/* Замена Фона */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsBgReplacerOpen((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400 p-3"
          >
            {isBgReplacerOpen ? '▼' : '►'} Замена Фона
          </button>
          {isBgReplacerOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <BackgroundReplacer
                onGenerate={props.onGenerateBackgroundReplacement}
                isLoading={props.isLoading}
                sourceAspectRatio={props.sourceAspectRatio}
              />
            </div>
          )}
        </div>

        {/* Замена Текстуры */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsTextureTransplanterOpen((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400 p-3"
          >
            {isTextureTransplanterOpen ? '▼' : '►'} Замена Текстуры
          </button>
          {isTextureTransplanterOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <TextureTransplanter
                onGenerate={props.onGenerateTextureReplacement}
                isLoading={props.isLoading}
                activeImageUrl={props.activeNode?.imageUrl ?? null}
                sourceAspectRatio={props.sourceAspectRatio}
              />
            </div>
          )}
        </div>

        {/* Замена Стиля */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsStyleTransplanterOpen((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400 p-3"
          >
            {isStyleTransplanterOpen ? '▼' : '►'} Замена Стиля
          </button>
          {isStyleTransplanterOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <StyleTransplanter
                onGenerate={props.onGenerateStyleReplacement}
                isLoading={props.isLoading}
                sourceAspectRatio={props.sourceAspectRatio}
              />
            </div>
          )}
        </div>

        {/* Внедрение Объекта */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsObjectInjectorOpen((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400 p-3"
          >
            {isObjectInjectorOpen ? '▼' : '►'} Внедрение Объекта
          </button>
          {isObjectInjectorOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <ObjectInjector
                onGenerate={props.onGenerateObjectInjection}
                activeImageUrl={props.activeNode?.imageUrl ?? null}
                sourceAspectRatio={props.sourceAspectRatio}
              />
            </div>
          )}
        </div>

        {/* Редактор по Стрелкам */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-cyan-400">Редактор по Стрелкам</h4>
            <p className="text-xs text-gray-400 mt-1">Точечные правки с помощью текстовых инструкций.</p>
          </div>

          {/* === ПОСЛЕ РЕДАКТОРА (когда есть превью) — здесь тоже выбор модели === */}
          {arrowMapPreviewUrl ? (
            <div className="space-y-3">
              <Label title="Модель" />
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
                {(['gemini', 'seedream'] as const).map((model) => (
                  <button
                    key={model}
                    onClick={() => setArrowEditorModel(model)}
                    type="button"
                    className={cx(
                      'py-1.5 rounded-md text-xs font-semibold transition-colors',
                      arrowEditorModel === model ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                    )}
                  >
                    {model === 'gemini' ? 'Nano Banana' : 'SeeDream'}
                  </button>
                ))}
              </div>

              <div>
                <Label title="Карта инструкций (превью)" />
                <div className="relative h-24 w-full rounded-lg border border-cyan-700 bg-gray-950 overflow-hidden">
                  <img
                    src={arrowMapPreviewUrl}
                    alt="Arrow map preview"
                    className="h-full w-auto mx-auto object-contain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (arrowMapPreviewUrl) URL.revokeObjectURL(arrowMapPreviewUrl);
                    setArrowMapPreviewUrl(null);
                    // если хочешь сразу возвращаться в редактор:
                    // setIsArrowEditorOpen(true);
                  }}
                  className="text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md py-2"
                  type="button"
                >
                  Изменить
                </button>
                <button
                  onClick={handleSendArrowEdits}
                  className="text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md py-2"
                  type="button"
                >
                  Отправить
                </button>
              </div>
            </div>
          ) : (
            // === ДО РЕДАКТОРА — выбор модели + кнопка открытия редактора ===
            <div className="space-y-3">
              <Label title="Модель" />
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
                {(['gemini', 'seedream'] as const).map((model) => (
                  <button
                    key={model}
                    onClick={() => setArrowEditorModel(model)}
                    type="button"
                    className={cx(
                      'py-1.5 rounded-md text-xs font-semibold transition-colors',
                      arrowEditorModel === model ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                    )}
                  >
                    {model === 'gemini' ? 'Nano Banana' : 'SeeDream'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsArrowEditorOpen(true)}
                disabled={!props.activeNode}
                className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-cyan-800 hover:bg-cyan-700 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                ✍️ Открыть редактор
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Портал стрелочного редактора */}
      {isArrowEditorOpen && props.activeNode && (
        <MultiArrowEditor
          imageSrc={props.activeNode.imageUrl}
          onCancel={() => setIsArrowEditorOpen(false)}
          onConfirm={handleArrowEditorConfirm}
        />
      )}
    </div>
  );
};

```

---

## Файл: `src/components/sidebar/StyleTransplanter.tsx`

```typescript
// src/components/sidebar/StyleTransplanter.tsx
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { cx } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/lib/types';
import { Label } from '../ui/FormControls';
import { UniversalCropper } from '@/components/cropper/UniversalCropper';

type ModelForStyle = 'gemini' | 'seedream';

interface StyleTransplanterProps {
  onGenerate: (referenceFile: File, model: ModelForStyle) => void;
  isLoading: boolean;
  sourceAspectRatio: number; // ОБЯЗАТЕЛЬНО для блокировки кроппера
}

export const StyleTransplanter: React.FC<StyleTransplanterProps> = ({
  onGenerate,
  isLoading,
  sourceAspectRatio,
}) => {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelForStyle>('gemini');

  // Управляет открытием/закрытием кроппера и хранит URL сырого файла
  const [cropRequest, setCropRequest] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReady = referenceFile && !isLoading;

  // Шаг 1: Пользователь выбирает файл, открываем кроппер
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Неверный тип файла. Нужен PNG, JPEG или WebP.');
      return;
    }
    setError(null);

    const url = URL.createObjectURL(file);
    setCropRequest(url);
  };

  // Шаг 2: Кроппер отработал, получаем готовый Blob
  const handleCropConfirm = (croppedBlob: Blob) => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);

    const croppedFile = new File([croppedBlob], "style_crop.png", { type: "image/png" });
    setReferenceFile(croppedFile);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  // Шаг 2.1: Пользователь отменил кроп
  const handleCropCancel = () => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Хук для маленького превью уже обрезанного файла
  useEffect(() => {
    if (!referenceFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(referenceFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [referenceFile]);

  const handleSubmit = () => {
    if (!isReady || !referenceFile) return;
    onGenerate(referenceFile, selectedModel);
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок загрузки */}
        <div>
          <Label title="Референс стиля" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ACCEPTED_FILE_TYPES.join(',')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            {previewUrl ? 'Заменить стиль' : '+ Загрузить стиль'}
          </button>

          {previewUrl && (
            <div className="mt-3 relative h-20 w-full flex items-center justify-center rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
              <img
                src={previewUrl}
                alt="Style reference preview"
                className="h-full w-auto object-contain"
              />
            </div>
          )}
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        {/* Блок выбора модели */}
        <div>
          <Label title="Модель" />
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
            {(['gemini', 'seedream'] as ModelForStyle[]).map(model => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={cx(
                  "py-1.5 rounded-md text-xs font-semibold transition-colors",
                  selectedModel === model
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                )}
              >
                {model === 'gemini' ? 'Nano Banana' : 'SeeDream'}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка действия */}
        <button
          onClick={handleSubmit}
          disabled={!isReady}
          className={cx(
            "w-full text-sm font-semibold py-2.5 rounded-lg transition",
            isReady
              ? "bg-cyan-600 hover:bg-cyan-500 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? "Обработка..." : "Применить стиль"}
        </button>
      </div>

      {/* Модалка с кроппером, которая всплывет когда надо */}
      {cropRequest && (
        <UniversalCropper
          imageSrc={cropRequest}
          aspectRatio={sourceAspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};
```

---

## Файл: `src/components/sidebar/TextureTransplanter.tsx`

```typescript
// src/components/sidebar/TextureTransplanter.tsx
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { cx } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/lib/types';
import { Label } from '../ui/FormControls';
import { ArrowPointer } from '../editor/ArrowPointer';
import { UniversalCropper } from '../cropper/UniversalCropper'; // <<< 1. ИМПОРТ КРОППЕРА
import Image from 'next/image';

interface TextureTransplanterProps {
  onGenerate: (targetMapFile: File, textureFile: File, model: 'gemini' | 'seedream') => void;
  isLoading: boolean;
  activeImageUrl: string | null;
  sourceAspectRatio: number; // <<< 2. ДОБАВЛЕН ПРОПС
}

export const TextureTransplanter: React.FC<TextureTransplanterProps> = ({
  onGenerate,
  isLoading,
  activeImageUrl,
  sourceAspectRatio, // <<< 2. ПОЛУЧАЕМ ПРОПС
}) => {
  // Этот стейт теперь хранит ГОТОВЫЙ, ОБРЕЗАННЫЙ файл
  const [textureFile, setTextureFile] = useState<File | null>(null);
  const [texturePreview, setTexturePreview] = useState<string | null>(null);
  const [targetMapFile, setTargetMapFile] = useState<File | null>(null);
  const [targetMapPreview, setTargetMapPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isPointerEditorOpen, setIsPointerEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // <<< 3. НОВЫЙ СТЕЙТ ДЛЯ УПРАВЛЕНИЯ КРОППЕРОМ
  const [cropRequest, setCropRequest] = useState<string | null>(null);

  const isReady = textureFile && targetMapFile && !isLoading;

  useEffect(() => {
    setTextureFile(null);
    setTargetMapFile(null);
  }, [activeImageUrl]);

  useEffect(() => {
    if (!textureFile) {
      setTexturePreview(null);
      return;
    }
    const url = URL.createObjectURL(textureFile);
    setTexturePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [textureFile]);

  useEffect(() => {
    if (!targetMapFile) {
      setTargetMapPreview(null);
      return;
    }
    const url = URL.createObjectURL(targetMapFile);
    setTargetMapPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [targetMapFile]);
  
  // <<< 4. ОБНОВЛЕННАЯ ЛОГИКА ЗАГРУЗКИ: ТЕПЕРЬ ОНА ОТКРЫВАЕТ КРОППЕР
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Неверный тип файла. Нужен PNG, JPEG или WebP.');
      return;
    }
    setError(null);
    
    // Создаем временный URL и отправляем его в стейт, чтобы открыть модалку кроппера
    const url = URL.createObjectURL(file);
    setCropRequest(url);
  };

  // <<< 5. НОВЫЕ ОБРАБОТЧИКИ ДЛЯ РЕЗУЛЬТАТОВ КРОППЕРА
  const handleCropConfirm = (croppedBlob: Blob) => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);

    const croppedFile = new File([croppedBlob], "texture_crop.png", { type: "image/png" });
    setTextureFile(croppedFile);
  };

  const handleCropCancel = () => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);
  };
  
  const handlePointerConfirm = (blob: Blob) => {
    const file = new File([blob], 'target_map.png', { type: 'image/png' });
    setTargetMapFile(file);
    setIsPointerEditorOpen(false);
  };

  const handleSubmit = () => {
    if (!isReady || !targetMapFile || !textureFile) return;
    onGenerate(targetMapFile, textureFile, 'gemini');
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок 1: Загрузка Текстуры */}
        <div>
          <Label title="1. Загрузите текстуру" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ACCEPTED_FILE_TYPES.join(',')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            {texturePreview ? 'Заменить текстуру' : '+ Выбрать текстуру'}
          </button>
          {texturePreview && (
            <div className="mt-3 relative h-20 w-full rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
              <Image src={texturePreview} alt="Texture preview" fill sizes="120px" className="object-cover" />
            </div>
          )}
        </div>

        {/* Блок 2: Указание Цели */}
        <div>
          <Label title="2. Укажите цель на фото" />
          <button
            type="button"
            onClick={() => setIsPointerEditorOpen(true)}
            disabled={!activeImageUrl}
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {targetMapPreview ? 'Изменить указатель' : '🎯 Поставить указатель'}
          </button>
           {targetMapPreview && (
            <div className="mt-3 relative h-20 w-full rounded-lg border border-cyan-700 bg-gray-950 overflow-hidden">
              <Image src={targetMapPreview} alt="Target map preview" fill sizes="120px" className="object-contain" />
            </div>
          )}
        </div>
        
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

        {/* Кнопка действия */}
        <button
          onClick={handleSubmit}
          disabled={!isReady}
          className={cx(
            "w-full text-sm font-semibold py-2.5 rounded-lg transition",
            isReady
              ? "bg-cyan-600 hover:bg-cyan-500 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? "Обработка..." : "Применить Текстуру"}
        </button>
      </div>

      {isPointerEditorOpen && activeImageUrl && (
        <ArrowPointer
          imageSrc={activeImageUrl}
          onConfirm={handlePointerConfirm}
          onCancel={() => setIsPointerEditorOpen(false)}
        />
      )}

      {/* <<< 6. ДОБАВЛЕН УСЛОВНЫЙ РЕНДЕР КРОППЕРА */}
      {cropRequest && (
        <UniversalCropper
          imageSrc={cropRequest}
          aspectRatio={sourceAspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};
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
import { GenerationNode } from "@/lib/types";
import Image from "next/image";

// --- Внутренний компонент №1: Лоток с базовыми результатами ---
const BaseResultsTray: React.FC<{
  nodes: GenerationNode[];
  selectedUrl: string | null;
  onSelect: (node: GenerationNode) => void;
  onPromote: (id: string) => void;
  onDelete: (id: string) => void;
  isWorkspace?: (id: string) => boolean;
  onDeleteWorkspace?: (id: string) => void;
}> = ({ nodes, selectedUrl, onSelect, onPromote, onDelete, isWorkspace, onDeleteWorkspace }) => {
  return (
    <div className="bg-gray-850 border border-gray-800 rounded-xl">
      <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
        Лоток базовых результатов (кликни для сравнения, затем отправь в PRO)
      </div>
      <div className="p-3 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
        {nodes.map((node) => {
          const isProWorkspace = isWorkspace?.(node.id) ?? false;
          return (
            <div key={node.id} className="relative group">
              <button
                onClick={() => (isProWorkspace ? onPromote(node.id) : onSelect(node))}
                title={isProWorkspace ? "Переключиться на этот воркспейс" : "Выбрать для сравнения"}
                className={cx(
                  "relative w-full aspect-square bg-gray-900 rounded-md overflow-hidden transition-all focus:outline-none",
                  node.imageUrl === selectedUrl
                    ? "ring-2 ring-cyan-500"
                    : "hover:ring-2 ring-gray-600",
                  isProWorkspace && "border-2 border-cyan-700/50" // Подсвечиваем воркспейсы
                )}
              >
                <Image
                  src={node.imageUrl}
                  alt={`Base result ${node.id}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {isProWorkspace && (
                   <div className="absolute top-0 left-0 bg-cyan-800/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-md">PRO</div>
                )}
              </button>

              {/* БЫЛО:
              <button
                onClick={() => onDelete(node.id)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Удалить"
                aria-label="Удалить"
              >
                ✕
              </button>
              <button
                onClick={() => onPromote(node.id)}
                className="absolute bottom-1 right-1 text-[10px] font-bold bg-cyan-600 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Отправить в PRO"
              >
                В PRO →
              </button>
              */}
              
              {/* СТАЛО: Умные кнопки */}
              {!isProWorkspace ? (
                <>
                  <button
                    onClick={() => onDelete(node.id)}
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить базовый результат"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => onPromote(node.id)}
                    className="absolute bottom-1 right-1 text-[10px] font-bold bg-cyan-600 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Отправить в PRO"
                  >
                    В PRO →
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onDeleteWorkspace?.(node.id)}
                  className="absolute bottom-1 right-1 text-[10px] font-bold bg-red-700/90 hover:bg-red-600 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Удалить весь воркспейс"
                >
                  Удалить PRO
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- Внутренний компонент №2: Сравнение "до/после" ---
const CompareView: React.FC<{
  sourceUrl: string | null;
  resultUrl: string | null;
  comparePos: number;
  setComparePos: (pos: number) => void;
}> = ({ sourceUrl, resultUrl, comparePos, setComparePos }) => {
  return (
    <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
      {!sourceUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
          Загрузите скетч
        </div>
      )}

      {sourceUrl && (
        <Image
          src={sourceUrl}
          alt="Source"
          fill
          sizes="80vw"
          className="object-contain"
        />
      )}

      {sourceUrl && resultUrl && (
        <>
          <Image
            src={resultUrl}
            alt="Result (clipped)"
            fill
            sizes="80vw"
            className="object-contain"
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
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[60%] h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </>
      )}
    </div>
  );
};

// --- Внутренний компонент №3: Дерево PRO-генераций ---
const GenerationTree: React.FC<{
  nodes: GenerationNode[];
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
}> = ({ nodes, activeNodeId, onSelectNode }) => {
  const nodesByParent = nodes.reduce(
    (acc: Record<string, GenerationNode[]>, node: GenerationNode) => {
      const parentId = node.parentId ?? "root";
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(node);
      return acc;
    },
    {} as Record<string, GenerationNode[]>
  );

  const renderBranch = (parentId: string | null) => {
    const key = parentId ?? "root";
    const children = nodesByParent[key];
    if (!children || children.length === 0) return null;

    return (
      <div
        className={cx(
          "flex items-start gap-3",
          parentId !== null && "pl-6 border-l border-gray-700/50"
        )}
      >
        {children.map((node) => (
          <div key={node.id} className="flex flex-col items-center gap-2">
            <button
              onClick={() => onSelectNode(node.id)}
              className={cx(
                "relative w-24 h-24 bg-gray-900 rounded-md overflow-hidden transition-all focus:outline-none shrink-0",
                node.id === activeNodeId
                  ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                  : "hover:ring-2 ring-gray-600"
              )}
              title={`Выбрать узел #${node.id.slice(0, 4)}`}
            >
              <Image
                src={node.imageUrl}
                alt={`Node ${node.id}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
            <div className="text-[10px] text-gray-500">#{node.id.slice(0, 4)}</div>
            <div className="flex flex-col gap-3">{renderBranch(node.id)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-850 border border-gray-800 rounded-xl">
      <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
        Дерево Генераций (кликни, чтобы выбрать исходник)
      </div>
      <div className="p-4 overflow-x-auto">{renderBranch(null)}</div>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ CANVAS ---
interface CanvasProps {
  isLoading: boolean;
  sourceFile: File | null;
  sourceUrl: string | null;
  activeTab: "BASE" | "PRO";
  baseResults: GenerationNode[];
  selectedBaseResultUrl: string | null;
  compareSourceUrl: string | null;
  selectBaseResultForCompare: (node: GenerationNode) => void;
  comparePos: number;
  setComparePos: (pos: number) => void;
  activeHistory: GenerationNode[];
  activeNodeId: string | null;
  setActiveNodeId: (id: string) => void;
  activeNode: GenerationNode | null;
  handlePromoteToPro: (id: string) => void;
  deleteBaseResult: (nodeId: string) => void;
  // СТАЛО: Пропсы для работы с воркспейсами
  workspaces: { [rootNodeId: string]: GenerationNode[] };
  deleteWorkspace: (workspaceId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  isLoading,
  sourceFile,
  sourceUrl,
  activeTab,
  baseResults,
  selectedBaseResultUrl,
  compareSourceUrl,
  selectBaseResultForCompare,
  comparePos,
  setComparePos,
  activeHistory,
  activeNodeId,
  setActiveNodeId,
  activeNode,
  handlePromoteToPro,
  deleteBaseResult,
  // СТАЛО: Получаем новые пропсы
  workspaces,
  deleteWorkspace,
}) => {
  const handleDownloadSource = () => {
    if (!sourceFile) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(sourceFile);
    link.download = sourceFile.name || "source.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadResult = () => {
    const url =
      activeTab === "BASE" ? selectedBaseResultUrl : activeNode?.imageUrl;
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = "result.png";
    link.click();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {isLoading ? "Обработка…" : "Готово"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSource}
            disabled={!sourceFile}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Скачать исходник
          </button>
          <button
            onClick={handleDownloadResult}
            disabled={!(activeTab === "BASE" ? selectedBaseResultUrl : activeNode)}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Скачать результат
          </button>
        </div>
      </div>

      <div className="bg-gray-850 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
          {activeTab === "BASE"
            ? "Сравнение с исходным скетчем"
            : `Мастерская: узел #${activeNodeId?.slice(0, 4) ?? "..."}`
          }
        </div>

        {activeTab === "BASE" && (
          <CompareView
            sourceUrl={compareSourceUrl || sourceUrl}
            resultUrl={selectedBaseResultUrl}
            comparePos={comparePos}
            setComparePos={setComparePos}
          />
        )}

        {activeTab === "PRO" && (
          <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
            {!activeNode && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                Выберите базовый результат для доработки
              </div>
            )}
            {activeNode && (
              <Image
                src={activeNode.imageUrl}
                alt="Active PRO node"
                fill
                sizes="80vw"
                className="object-contain"
              />
            )}
            {isLoading && <div className="absolute inset-0 bg-gray-800/50 animate-pulse" />}
          </div>
        )}
      </div>

      {activeTab === "BASE" && baseResults.length > 0 && (
        <BaseResultsTray
          nodes={baseResults}
          selectedUrl={null}
          onSelect={selectBaseResultForCompare}
          onPromote={handlePromoteToPro}
          onDelete={deleteBaseResult}
          isWorkspace={(id) => !!workspaces[id]}
          onDeleteWorkspace={deleteWorkspace}
        />
      )}

      {activeTab === "PRO" && (
        <>
          {activeHistory.length === 0 && baseResults.length > 0 && (
            <div className="bg-gray-850 border border-gray-800 rounded-xl">
              <div className="px-3 py-2 border-b border-gray-800 text-sm font-semibold text-yellow-300">
                Шаг 1: Выберите исходник для доработки
              </div>
              <BaseResultsTray
                nodes={baseResults}
                selectedUrl={null}
                onSelect={selectBaseResultForCompare}
                onPromote={handlePromoteToPro}
                onDelete={deleteBaseResult}
                // СТАЛО: Передаем логику для работы с воркспейсами
                isWorkspace={(id) => !!workspaces[id]}
                onDeleteWorkspace={deleteWorkspace}
              />
            </div>
          )}

          {activeHistory.length > 0 && (
            <GenerationTree
              nodes={activeHistory}
              activeNodeId={activeNodeId}
              onSelectNode={setActiveNodeId}
            />
          )}
        </>
      )}

      <div className="text-[11px] text-gray-500">
        Лайфхак: короткий промпт → выбери модель → Ctrl/Cmd+Enter.
      </div>
    </section>
  );
};
```

---

## Файл: `src/components/workspace/Sidebar.tsx`

```typescript
// src/components/workspace/Sidebar.tsx
import React from "react";
import type { SidebarProps } from "./Sidebar.types";
import { ModeSwitcher } from '../sidebar/ModeSwitcher';
import { FileUpload } from '../sidebar/FileUpload';
import { JsonViewer } from '../sidebar/JsonViewer';
import { EnvironmentSettings } from '../sidebar/EnvironmentSettings';
import { PromptEngineer } from '../sidebar/PromptEngineer';
import { ProTools } from '../sidebar/ProTools';
import { MainPrompt } from '../sidebar/MainPrompt';
import { ModelSelector } from '../sidebar/ModelSelector';
import { ModelSettings } from '../sidebar/ModelSettings';
import { ActionButtons } from '../sidebar/ActionButtons';

export const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <aside className="bg-gray-850 border border-gray-800 rounded-xl p-4 lg:p-5 sticky top-6 h-fit">

      <ModeSwitcher
        activeTab={props.activeTab}
        handleTabChange={props.handleTabChange}
      />

      {/* --- РАЗДЕЛЕНИЕ ЛОГИКИ --- */}

      {/* Контент для вкладки BASE: Старый добрый набор компонентов */}
      {props.activeTab === 'BASE' && (
        <>
          <div className="space-y-5">
            <FileUpload
              imageInfo={props.imageInfo}
              sourceFile={props.sourceFile}
              dropRef={props.dropRef}
              onDrop={props.onDrop}
              onFileChange={props.onFileChange}
            />
            <JsonViewer
              isJsonViewerOpen={props.isJsonViewerOpen}
              setIsJsonViewerOpen={props.setIsJsonViewerOpen}
              onJsonFileChange={props.onJsonFileChange}
              jsonError={props.jsonError}
              jsonContent={props.jsonContent}
            />
            <EnvironmentSettings
              windowView={props.windowView}
              setWindowView={props.setWindowView}
              doorView={props.doorView}
              setDoorView={props.setDoorView}
            />
            <PromptEngineer
              showRefiner={props.showRefiner}
              setShowRefiner={props.setShowRefiner}
              rawPrompt={props.rawPrompt}
              setRawPrompt={props.setRawPrompt}
              llmSettingsByModel={props.llmSettingsByModel}
              selectedModel={props.selectedModel}
              handleLlmSettingsChange={props.handleLlmSettingsChange}
              sendImageToLlm={props.sendImageToLlm}
              setSendImageToLlm={props.setSendImageToLlm}
              sourceFile={props.sourceFile}
              onRefinePrompt={props.onRefinePrompt}
              isRefining={props.isRefining}
              refineError={props.refineError}
            />
          </div>

          {/* Общие блоки теперь являются частью BASE, а не глобальными */}
          <MainPrompt
            activeTab={props.activeTab}
            prompt={props.prompt}
            setPrompt={props.setPrompt}
            promptTokenCount={props.promptTokenCount}
            showNeg={props.showNeg}
            setShowNeg={props.setShowNeg}
            negativePrompt={props.negativePrompt}
            setNegativePrompt={props.setNegativePrompt}
            negativeTokenCount={props.negativeTokenCount}
          />

          <ModelSelector
            selectedModel={props.selectedModel}
            setSelectedModel={props.setSelectedModel}
          />

          <ModelSettings
            selectedModel={props.selectedModel}
            seedLock={props.seedLock}
            setSeedLock={props.setSeedLock}
            randomizeSeed={props.randomizeSeed}
            qwenSettings={props.qwenSettings}
            handleQwenChange={props.handleQwenChange}
            fluxSettings={props.fluxSettings}
            handleFluxChange={props.handleFluxChange}
            seedreamSettings={props.seedreamSettings}
            handleSeedreamChange={props.handleSeedreamChange}
            seedreamTargetSize={props.seedreamTargetSize}
            setSeedreamTargetSize={props.setSeedreamTargetSize}
            seedreamSizeWarning={props.seedreamSizeWarning}
          />

          <ActionButtons
            isReadyToGenerate={props.isReadyToGenerate}
            isLoading={props.isLoading}
            onGenerate={props.onGenerate}
            onCancel={props.onCancel}
            onClear={props.onClear}
            error={props.error}
            activeTab={props.activeTab}
            sourceFile={props.sourceFile}
          />
        </>
      )}

      {/* Контент для вкладки PRO: Только наш новый ProTools */}
      {props.activeTab === 'PRO' && (
        <ProTools {...props} />
      )}
    </aside>
  );
};
```

---

## Файл: `src/components/workspace/Sidebar.types.ts`

```typescript
// src/components/workspace/Sidebar.types.ts
import { ChangeEvent, DragEvent, RefObject } from "react";
import {
  FluxSettings,
  LlmSettings,
  Model,
  GenerationNode,
  QwenSettings,
  SeedreamSettings,
} from "@/lib/types";

// Да, он все еще большой, но теперь он живет отдельно и не мозолит глаза.
export interface SidebarProps {
  activeTab: 'BASE' | 'PRO';
  handleTabChange: (tab: 'BASE' | 'PRO') => void;
  handleChangeSource: () => void;
  activeHistory: GenerationNode[];
  imageInfo: { w: number; h: number } | null;
  sourceFile: File | null;
  dropRef: RefObject<HTMLLabelElement | null>;
  onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showRefiner: boolean;
  setShowRefiner: (value: React.SetStateAction<boolean>) => void;
  rawPrompt: string;
  setRawPrompt: (value: string) => void;
  llmSettingsByModel: { [key in Model]?: Partial<LlmSettings> };
  handleLlmSettingsChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  onGenerateBackgroundReplacement: (file: File, targets: { window: boolean; door: boolean }, model: 'gemini' | 'seedream') => void;
  onGenerateTextureReplacement: (targetMapFile: File, textureFile: File, model: 'gemini' | 'seedream') => void;
  onGenerateStyleReplacement: (referenceFile: File, model: 'gemini' | 'seedream') => void;
  onGenerateObjectInjection: (targetMapFile: File, objectFile: File, model: 'gemini' | 'seedream') => void;
  onGenerateArrowEdits: (imageBlob: Blob, instructionsText: string, model: 'gemini' | 'seedream') => void;
  onCancel: () => void;
  onClear: () => void;
  error: string | null;
  jsonContent: string | null;
  isJsonViewerOpen: boolean;
  setIsJsonViewerOpen: (value: React.SetStateAction<boolean>) => void;
  jsonError: string | null;
  onJsonFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  promptTokenCount: number;
  negativeTokenCount: number;
  seedreamTargetSize: 1024 | 1280 | 'original';
  setSeedreamTargetSize: (size: 1024 | 1280 | 'original') => void;
  seedreamSizeWarning: string | null;
  windowView: string;
  setWindowView: (value: string) => void;
  doorView: string;
  setDoorView: (value: string) => void;
  sourceAspectRatio: number;
  activeNode: GenerationNode | null;
}
```

---

## Файл: `src/hooks/useFileHandler.ts`

```typescript
// src/hooks/useFileHandler.ts
import { useState, useCallback, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import { readImageDims } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from "@/lib/types";

export function useFileHandler() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null); // <<< ВОТ ОНА, РОДИМАЯ
  const [imageInfo, setImageInfo] = useState<{ w: number; h: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const dropRef = useRef<HTMLLabelElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return setFileError(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB} MB.`);
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return setFileError("Неверный тип файла. Используйте PNG, JPEG или WebP.");
    }
    
    setFileError(null);
    setSourceFile(file);

    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    const url = URL.createObjectURL(file);
    setSourceUrl(url);

    const reader = new FileReader();
    reader.onload = () => {
      setSourceDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const dims = await readImageDims(file);
      setImageInfo(dims);
    } catch {
      setImageInfo(null);
    }
  }, [sourceUrl]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onPaste = useCallback(async (e: globalThis.ClipboardEvent) => {
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
  }, [handleFileSelect]);

  const clearFile = () => {
    setSourceFile(null);
    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }
    setSourceUrl(null);
    setSourceDataUrl(null);
    setImageInfo(null);
    setFileError(null);
  };

  useEffect(() => {
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onPaste]);

  useEffect(() => {
    return () => {
      if (sourceUrl && sourceUrl.startsWith("blob:")) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, [sourceUrl]);

  return {
    sourceFile,
    sourceUrl,
    sourceDataUrl,
    imageInfo,
    fileError,
    dropRef,
    onFileChange,
    onDrop,
    clearFile,
  };
}
```

---

## Файл: `src/hooks/useImageWorkspace.ts`

```typescript
// src/hooks/useImageWorkspace.ts
import { useState, useMemo, useEffect, useRef, ChangeEvent, KeyboardEvent, useCallback } from "react";
import { encode } from "gpt-tokenizer";
import { LlmSettings, Model, GenerationNode } from "@/lib/types";
import { loadPersist, savePersist } from "@/lib/utils";
import * as api from "@/lib/api";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useSettingsManager } from "@/hooks/useSettingsManager";
import { LLM_SYSTEM_PROMPT } from "@/lib/constants";

const defaultLlmSettings: LlmSettings = {
  model: "gpt-5-mini",
  systemPrompt: LLM_SYSTEM_PROMPT,
  temperature: 1.0,
  topP: 1,
  maxCompletionTokens: 2000,
};

const initialLlmSettingsByModel: { [key in Model]?: Partial<LlmSettings> } = {
  gemini: { ...defaultLlmSettings },
  qwen: { ...defaultLlmSettings },
  flux: { ...defaultLlmSettings },
  seedream: { ...defaultLlmSettings },
};

export function useImageWorkspace() {
  const {
    sourceFile,
    sourceUrl,
    sourceDataUrl,
    imageInfo,
    fileError,
    dropRef,
    onFileChange,
    onDrop,
    clearFile,
  } = useFileHandler();

  const settingsManager = useSettingsManager(imageInfo);

  const [activeTab, setActiveTab] = useState<"BASE" | "PRO">("BASE");
  const [baseResults, setBaseResults] = useState<GenerationNode[]>([]);
  const [selectedBaseResultUrl, setSelectedBaseResultUrl] = useState<string | null>(null);
  const [compareSourceUrl, setCompareSourceUrl] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<{ [rootNodeId: string]: GenerationNode[] }>({});
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeNodeDims, setActiveNodeDims] = useState<{w: number, h: number} | null>(null);
  const [prompt, setPrompt] = useState("");
  const [rawPrompt, setRawPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [sendImageToLlm, setSendImageToLlm] = useState(true);
  const [showRefiner, setShowRefiner] = useState(false);
  const [llmSettingsByModel, setLlmSettingsByModel] = useState(initialLlmSettingsByModel);
  const [negativePrompt, setNegativePrompt] = useState("blurry, ugly, deformed, text, watermark");
  const [showNeg, setShowNeg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparePos, setComparePos] = useState(50);
  const [windowView, setWindowView] = useState("a dense Scandinavian forest");
  const [doorView, setDoorView] = useState("a cozy antechamber (changing room)");
  const abortControllerRef = useRef<AbortController | null>(null);
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [promptTokenCount, setPromptTokenCount] = useState(0);
  const [negativeTokenCount, setNegativeTokenCount] = useState(0);

  useEffect(() => {
    if (fileError) setError(fileError);
  }, [fileError]);

  const activeHistory = useMemo(
    () => workspaces[activeWorkspaceId ?? ""] ?? [],
    [workspaces, activeWorkspaceId]
  );
  const activeNode = useMemo(
    () => activeHistory.find((node) => node.id === activeNodeId) ?? null,
    [activeNodeId, activeHistory]
  );
  
  useEffect(() => {
    if (!activeNode) {
      setActiveNodeDims(null);
      return;
    }

    const getDimsFromUrl = (url: string): Promise<{ w: number, h: number }> => 
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });

    getDimsFromUrl(activeNode.imageUrl).then(setActiveNodeDims);
    
  }, [activeNode]);

  const isReadyToGenerate = useMemo(() => {
    if (activeTab === "BASE") return !!sourceFile && !!prompt.trim() && !isLoading;
    return !!activeNode && !!prompt.trim() && !isLoading;
  }, [activeTab, sourceFile, activeNode, prompt, isLoading]);

  const fail = useCallback((msg: string) => {
    setError(msg);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (sourceFile) {
      setError(null);
      setSelectedBaseResultUrl(null);
      setCompareSourceUrl(null);
      setActiveTab("BASE");
    }
  }, [sourceFile]);

  // persist load
  useEffect(() => {
    const p = loadPersist();
    if (!p) return;

    // --- НАЧАЛО ПАТЧА ---
    // Валидация состояния PRO-режима перед загрузкой
    const loadedWorkspaces = p.workspaces ?? {};
    const loadedActiveWorkspaceId = p.activeWorkspaceId ?? null;
    const loadedActiveNodeId = p.activeNodeId ?? null;

    let finalActiveWorkspaceId = null;
    let finalActiveNodeId = null;
    let finalActiveTab = p.activeTab ?? "BASE";

    // Проверяем, что сохраненный воркспейс и узел все еще существуют
    if (
      loadedActiveWorkspaceId &&
      loadedWorkspaces[loadedActiveWorkspaceId] &&
      loadedWorkspaces[loadedActiveWorkspaceId].some(node => node.id === loadedActiveNodeId)
    ) {
      // Все заебись, состояние консистентное. Восстанавливаем.
      finalActiveWorkspaceId = loadedActiveWorkspaceId;
      finalActiveNodeId = loadedActiveNodeId;
    } else if (finalActiveTab === "PRO") {
      // Если что-то пошло не так, а мы пытались загрузиться в PRO,
      // принудительно валимся в BASE, чтобы не показывать пустой экран.
      finalActiveTab = "BASE";
    }

    setWorkspaces(loadedWorkspaces);
    setActiveWorkspaceId(finalActiveWorkspaceId);
    setActiveNodeId(finalActiveNodeId);
    setActiveTab(finalActiveTab);
    // --- КОНЕЦ ПАТЧА ---

    // Остальные настройки грузим как обычно
    setBaseResults(p.baseResults ?? []);
    setSelectedBaseResultUrl(p.selectedBaseResultUrl ?? null);
    setPrompt(p.prompt ?? "");
    setNegativePrompt(p.negativePrompt ?? "blurry, ugly, deformed, text, watermark");
    if (p.selectedModel) settingsManager.setSelectedModel(p.selectedModel);
    if (p.qwenSettings) settingsManager.setQwenSettings(p.qwenSettings);
    if (p.fluxSettings) settingsManager.setFluxSettings(p.fluxSettings);
    if (p.seedreamSettings) settingsManager.setSeedreamSettings(p.seedreamSettings);
    if (p.llmSettingsByModel) setLlmSettingsByModel(p.llmSettingsByModel);
    if (typeof p.sendImageToLlm === "boolean") setSendImageToLlm(p.sendImageToLlm);
    if (typeof p.showRefiner === "boolean") setShowRefiner(p.showRefiner);
    if (typeof p.showNeg === "boolean") setShowNeg(p.showNeg);
    if (typeof p.seedLock === "boolean") settingsManager.setSeedLock(p.seedLock);
    if (typeof p.comparePos === "number") setComparePos(p.comparePos);
    if (p.seedreamTargetSize) settingsManager.setSeedreamTargetSize(p.seedreamTargetSize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // persist save
  useEffect(() => {
    savePersist({
      prompt,
      negativePrompt,
      llmSettingsByModel,
      sendImageToLlm,
      showRefiner,
      showNeg,
      comparePos,
      activeTab,
      baseResults,
      selectedBaseResultUrl,
      workspaces,
      activeWorkspaceId,
      // СТАЛО: Сохраняем ID активного узла
      activeNodeId,
      activeNodeDims,
      selectedModel: settingsManager.selectedModel,
      qwenSettings: settingsManager.qwenSettings,
      fluxSettings: settingsManager.fluxSettings,
      seedreamSettings: settingsManager.seedreamSettings,
      seedLock: settingsManager.seedLock,
      seedreamTargetSize: settingsManager.seedreamTargetSize,
      tab: "compare",
    });
  }, [
    prompt,
    negativePrompt,
    llmSettingsByModel,
    sendImageToLlm,
    showRefiner,
    showNeg,
    comparePos,
    activeTab,
    baseResults,
    selectedBaseResultUrl,
    workspaces,
    activeWorkspaceId,
    activeNodeId,
    activeNodeDims,
    
    // Раскладываем settingsManager на конкретные поля, чтобы исключить лишние срабатывания
    settingsManager.selectedModel,
    settingsManager.qwenSettings,
    settingsManager.fluxSettings,
    settingsManager.seedreamSettings,
    settingsManager.seedLock,
    settingsManager.seedreamTargetSize,
  ]);

  useEffect(() => {
    setPromptTokenCount(encode(prompt || "").length);
    setNegativeTokenCount(encode(negativePrompt || "").length);
  }, [prompt, negativePrompt]);

  useEffect(() => {
    if (selectedBaseResultUrl && !baseResults.some((node) => node.imageUrl === selectedBaseResultUrl)) {
      setSelectedBaseResultUrl(null);
    }
    if (activeWorkspaceId && !workspaces[activeWorkspaceId]) {
      setActiveWorkspaceId(null);
      setActiveNodeId(null);
      setActiveTab("BASE");
    }
  }, [baseResults, workspaces, selectedBaseResultUrl, activeWorkspaceId]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
    if (e.key === "Escape" && isLoading) onCancel();
  };

  const onGenerateTextureReplacement = async (
    targetMapFile: File, // сауна + стрелка
    textureFile: File,   // текстура
    model: 'gemini' | 'seedream'
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    const prompt = `The source image contains a prominent red arrow pointing to a target object. The reference image contains a texture. Your task is to replace the texture of the object indicated by the arrow with the texture from the reference image. Crucially: 1. The red arrow must be completely removed from the final result. 2. Preserve all other details of the source image: lighting, shadows, geometry, and un-targeted objects. The new texture must seamlessly integrate into the existing scene.`;
    const negativePrompt = "red arrow, pointer, indicator"; // Просим убрать остатки стрелки, если что

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model);

    const formData = new FormData();
    formData.append("image", targetMapFile); // Главное изображение - то, что со стрелкой
    formData.append("reference_image", textureFile); // Референс - текстура
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt,
        model: model,
        settings,
      };

      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка при генерации.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateStyleReplacement = async (
    referenceFile: File,
    model: 'gemini' | 'seedream'
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    // --- БЛОК ОПРЕДЕЛЕНИЯ РЕАЛЬНЫХ РАЗМЕРОВ АКТИВНОГО УЗЛА (как в onGenerateArrowEdits) ---
    const getDimsFromUrl = (url: string): Promise<{ w: number, h: number }> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });
    const activeNodeDims = await getDimsFromUrl(activeNode.imageUrl);
    // --- КОНЕЦ БЛОКА ---

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    // Наш железобетонный промпт
    const prompt = `Transfer the artistic style from the reference image to the source image. Strictly preserve the geometry, proportions, and object layout of the source image. Do not change the content, only the style.`;

    // Превращаем URL активной сауны в файл для отправки
    let sourceImageFile: File;
    try {
      const response = await fetch(activeNode.imageUrl);
      const blob = await response.blob();
      sourceImageFile = new File([blob], "pro_source.png", { type: blob.type });
    } catch {
      return fail("Не удалось загрузить изображение из активного узла.");
    }

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model, activeNodeDims);

    const formData = new FormData();
    formData.append("image", sourceImageFile); // Главное изображение - сауна
    formData.append("reference_image", referenceFile); // Референс - стиль
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt,
        model: model,
        settings,
      };

      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка при генерации.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateBackgroundReplacement = async (
    referenceFile: File,
    targets: { window: boolean; door: boolean },
    model: 'gemini' | 'seedream'
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    // --- БЛОК ОПРЕДЕЛЕНИЯ РЕАЛЬНЫХ РАЗМЕРОВ АКТИВНОГО УЗЛА (как в onGenerateArrowEdits) ---
    const getDimsFromUrl = (url: string): Promise<{ w: number, h: number }> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });
    const activeNodeDims = await getDimsFromUrl(activeNode.imageUrl);
    // --- КОНЕЦ БЛОКА ---

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    const targetAreas = [];
    if (targets.window) targetAreas.push("the windows");
    if (targets.door) targetAreas.push("the glass door");
    const promptTarget = targetAreas.join(" and ");

    if (!promptTarget) return fail("Не выбраны цели для замены фона.");

    const prompt = `In the source image, replace the background seen through ${promptTarget} with the scene from the reference image. Preserve the original sauna and its geometry. Do not improvise.`;

    let sourceImageFile: File;
    try {
      const response = await fetch(activeNode.imageUrl);
      const blob = await response.blob();
      sourceImageFile = new File([blob], "pro_source.png", { type: blob.type });
    } catch {
      return fail("Не удалось загрузить изображение из активного узла.");
    }

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model, activeNodeDims);

    const formData = new FormData();
    formData.append("image", sourceImageFile);
    formData.append("reference_image", referenceFile);
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt,
        model: model,
        settings,
      };

      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка при генерации.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateObjectInjection = async (
    targetMapFile: File, // сауна + стрелка
    objectFile: File,    // объект для внедрения
    model: 'gemini' | 'seedream'
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    // --- БЛОК ОПРЕДЕЛЕНИЯ РЕАЛЬНЫХ РАЗМЕРОВ АКТИВНОГО УЗЛА (как в onGenerateArrowEdits) ---
    const getDimsFromUrl = (url: string): Promise<{ w: number, h: number }> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });
    const activeNodeDims = await getDimsFromUrl(activeNode.imageUrl);
    // --- КОНЕЦ БЛОКА ---

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    // Наш новый, зашитый намертво промпт
    const prompt = `Seamlessly integrate the object from the reference image into the source image at the location indicated by the red arrow. The arrow must be completely removed from the final result. Match the lighting, shadows, and perspective of the source image to ensure the object looks natural in the environment.`;
    const negativePrompt = "red arrow, pointer, indicator"; // Просим убрать остатки стрелки

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model, activeNodeDims);

    const formData = new FormData();
    formData.append("image", targetMapFile); // Главное изображение - то, что со стрелкой
    formData.append("reference_image", objectFile); // Референс - объект
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt,
        model: model,
        settings,
      };

      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка при генерации.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateArrowEdits = async (
    imageBlob: Blob,
    instructionsText: string,
    model: 'gemini' | 'seedream'
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    if (!instructionsText.trim()) return fail("Нет инструкций для выполнения.");

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    // --- НАЧИНАЕТСЯ МАГИЯ ---

    // 1. Создаем ФАЙЛ из BLOB'а, который пришел из редактора.
    //    Это и есть наша картинка со стрелками.
    const imageFile = new File([imageBlob], 'arrow_edit_map.png', { type: 'image/png' });

    // 2. Собираем промпт, как и договаривались.
    const prompt = `Apply the edits indicated by the red arrows and text annotations on the image. The text next to each arrow is the instruction for that specific location. Here are the instructions again for clarity: [${instructionsText}]. Remove all arrows and text annotations from the final result.`;

    // 3. (ФИКС РАЗМЕРОВ SEEDREAM) Получаем реальные размеры ТЕКУЩЕЙ ноды, а не первого скетча.
    const getDimsFromUrl = (url: string): Promise<{ w: number, h: number }> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });

    const activeNodeDims = await getDimsFromUrl(activeNode.imageUrl);

    // 4. Готовим настройки, ПЕРЕДАВАЯ в них правильные размеры.
    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model, activeNodeDims);

    // 5. Собираем FormData с ПРАВИЛЬНЫМ файлом.
    const formData = new FormData();
    formData.append("image", imageFile); // <<< Отправляем файл со стрелками!
    formData.append("prompt", prompt);
    formData.append("negative_prompt", "text, annotations, arrows, indicators, pointers");
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt: "text, annotations, arrows, indicators, pointers", // негативный тоже сохраняем
        model: model,
        settings,
      };

      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка при генерации.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLlmSettingsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? parseFloat(value) : value;
    setLlmSettingsByModel((prev) => ({
      ...prev,
      [settingsManager.selectedModel]: {
        ...(prev[settingsManager.selectedModel] ?? {}),
        [name]: parsedValue,
      },
    }));
  };

  const onRefinePrompt = async () => {
    if (!rawPrompt.trim()) return;
    setIsRefining(true);
    setRefineError(null);
    abortControllerRef.current = new AbortController();

    function arrayBufferToBase64(buffer: ArrayBuffer): string {
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    let base64Image: string | undefined = undefined;
    if (sendImageToLlm && sourceFile) {
      const buffer = await sourceFile.arrayBuffer();
      base64Image = `data:${sourceFile.type};base64,${arrayBufferToBase64(buffer)}`;
    }

    const finalRawPrompt = `${rawPrompt.trim()}\n[VIEW_WINDOW: ${windowView}]\n[VIEW_DOOR: ${doorView}]`;
    const activeSettings = { ...defaultLlmSettings, ...llmSettingsByModel[settingsManager.selectedModel] };
    const payload = {
      prompt: finalRawPrompt,
      model: activeSettings.model,
      system: activeSettings.systemPrompt,
      temperature: activeSettings.temperature,
      top_p: activeSettings.topP,
      max_completion_tokens: activeSettings.maxCompletionTokens,
      ...(base64Image ? { image: base64Image } : {}),
    };

    try {
      const data = await api.refinePrompt(payload, abortControllerRef.current.signal);
      setPrompt(data.refinedPrompt);
      setShowRefiner(false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") setRefineError("Улучшение отменено.");
        else setRefineError(error.message);
      } else {
        setRefineError("Произошла неизвестная ошибка.");
      }
    } finally {
      setIsRefining(false);
    }
  };

  const onGenerate = async () => {
    if (!isReadyToGenerate) return;
    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    let currentImageFile: File;
    let parentId: string | null = null;
    if (activeTab === "BASE") {
      if (!sourceFile) return fail("Нет исходного файла.");
      currentImageFile = sourceFile;
    } else {
      if (!activeNode) return fail("Нет активного узла.");
      parentId = activeNodeId;
      try {
        const response = await fetch(activeNode.imageUrl);
        const blob = await response.blob();
        currentImageFile = new File([blob], "pro_source.png", { type: blob.type });
      } catch {
        return fail("Не удалось загрузить изображение из активного узла.");
      }
    }

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings();

    const formData = new FormData();
    formData.append("image", currentImageFile);
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", settingsManager.selectedModel);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeTab === 'BASE' ? sourceDataUrl : activeNode?.sourceImageUrl ?? null,
        prompt,
        negativePrompt,
        model: settingsManager.selectedModel,
        settings,
      };
      if (activeTab === 'BASE') {
        setBaseResults(prev => [...prev, newNode]);
        setSelectedBaseResultUrl(newNode.imageUrl);
        setCompareSourceUrl(newNode.sourceImageUrl);
      } else {
        if (!activeWorkspaceId) return fail("Критическая ошибка: нет воркспейса.");
        setWorkspaces((prev) => ({
          ...prev,
          [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
        }));
        setActiveNodeId(newNode.id);
      }
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка при генерации.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectBaseResultForCompare = (node: GenerationNode | null) => {
    if (node) {
      setSelectedBaseResultUrl(node.imageUrl);
      setCompareSourceUrl(node.sourceImageUrl);
    } else {
      setSelectedBaseResultUrl(null);
      setCompareSourceUrl(null);
    }
  };

  const handleJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (typeof event.target?.result !== "string") throw new Error("Не удалось прочитать файл.");
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
    if (file && file.type === "application/json") handleJsonFile(file);
    else if (file) setJsonError("Неверный тип файла. Нужен JSON.");
    e.target.value = "";
  };

  const onClear = () => {
    clearFile();
    setError(null);
    setActiveNodeId(null);
    setBaseResults([]);
    setSelectedBaseResultUrl(null);
    setActiveTab("BASE");
    settingsManager.setSeedLock(false);
  };

  const onCancel = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setError("Генерация отменена.");
  };

  const handleTabChange = (tab: "BASE" | "PRO") => {
    if (tab === "PRO" && !activeWorkspaceId && baseResults.length > 0) {
      handlePromoteToPro(baseResults[baseResults.length - 1].id);
      return;
    }
    setActiveTab(tab);
  };

  const handleChangeSource = () => {
    setActiveWorkspaceId(null);
    setActiveNodeId(null);
  };

  const handlePromoteToPro = (nodeId: string) => {
    const nodeToPromote = baseResults.find((node) => node.id === nodeId);
    if (!nodeToPromote) {
      return fail("Критическая ошибка: не найден базовый узел для 'продвижения'.");
    }

    // Если воркспейс для этого узла УЖЕ существует, просто переключаемся на него.
    if (workspaces[nodeId]) {
      const history = workspaces[nodeId];
      // Важно: делаем активным ПОСЛЕДНИЙ узел в истории этого воркспейса.
      setActiveNodeId(history[history.length - 1].id);
    } else {
      // Если нет — создаем новый воркспейс.
      const clonedRootNode = { ...nodeToPromote };
      setWorkspaces((prev) => ({ ...prev, [nodeId]: [clonedRootNode] }));
      // Первый узел в новом воркспейсе - это он сам.
      setActiveNodeId(nodeId);
    }

    // В любом случае, мы делаем этот воркспейс активным и переходим в PRO.
    setActiveWorkspaceId(nodeId);
    setActiveTab("PRO");
  };

  const deleteBaseResult = (nodeId: string) => {
    setBaseResults((prev) => prev.filter((node) => node.id !== nodeId));
  };

  // СТАЛО: Новая функция-киллер
  const deleteWorkspace = (workspaceId: string) => {
    setWorkspaces((prev) => {
      const newWorkspaces = { ...prev };
      delete newWorkspaces[workspaceId];
      return newWorkspaces;
    });
    if (activeWorkspaceId === workspaceId) {
      setActiveWorkspaceId(null);
      setActiveNodeId(null);
      setActiveTab('BASE');
    }
  };

  return {
    ...settingsManager,
    sourceFile,
    sourceUrl,
    imageInfo,
    activeNodeDims,
    onFileChange,
    onDrop,
    dropRef,
    activeTab,
    handleTabChange,
    handleChangeSource,
    baseResults,
    selectedBaseResultUrl,
    selectBaseResultForCompare,
    compareSourceUrl,
    setSelectedBaseResultUrl,
    handlePromoteToPro,
    activeHistory,
    activeNode,
    activeNodeId,
    setActiveNodeId,
    // СТАЛО: Отдаем сам объект воркспейсов наружу
    workspaces,
    comparePos,
    setComparePos,
    isLoading,
    error,
    isReadyToGenerate,
    prompt,
    setPrompt,
    rawPrompt,
    setRawPrompt,
    negativePrompt,
    setNegativePrompt,
    promptTokenCount,
    negativeTokenCount,
    isRefining,
    refineError,
    onRefinePrompt,
    sendImageToLlm,
    setSendImageToLlm,
    llmSettingsByModel,
    handleLlmSettingsChange,
    showRefiner,
    setShowRefiner,
    showNeg,
    setShowNeg,
    windowView,
    setWindowView,
    doorView,
    setDoorView,
    jsonContent,
    isJsonViewerOpen,
    setIsJsonViewerOpen,
    jsonError,
    onJsonFileChange,
    onGenerate,
    onGenerateBackgroundReplacement,
    onGenerateTextureReplacement,
    onGenerateStyleReplacement,
    onGenerateObjectInjection,
    onGenerateArrowEdits,
    onClear,
    onCancel,
    onKeyDown,
    deleteBaseResult,
    deleteWorkspace,
  };
}

```

---

## Файл: `src/hooks/useSettingsManager.ts`

```typescript
// src/hooks/useSettingsManager.ts
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Model, QwenSettings, FluxSettings, SeedreamSettings } from '@/lib/types';

export function useSettingsManager(imageInfo: { w: number; h: number } | null) {
  const [selectedModel, setSelectedModel] = useState<Model>("qwen");
  const [seedLock, setSeedLock] = useState(false);
  const [qwenSettings, setQwenSettings] = useState<QwenSettings>({ guidance_scale: 4, num_inference_steps: 30, seed: 0 });
  const [fluxSettings, setFluxSettings] = useState<FluxSettings>({ guidance_scale: 3.5, safety_tolerance: 2, seed: 0 });
  const [seedreamSettings, setSeedreamSettings] = useState<SeedreamSettings>({ seed: 0, width: 1024, height: 1024 });
  const [seedreamTargetSize, setSeedreamTargetSize] = useState<1024 | 1280 | 'original'>('original');
  const [seedreamSizeWarning, setSeedreamSizeWarning] = useState<string | null>(null);

  useEffect(() => {
    if (selectedModel !== 'seedream' || !imageInfo || seedreamTargetSize === 'original') {
      setSeedreamSizeWarning(null);
      return;
    }
    const { w: originalWidth, h: originalHeight } = imageInfo;
    const ratio = originalWidth / originalHeight;
    let targetWidth, targetHeight;
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
      setSeedreamSizeWarning(`Внимание: Результат будет увеличен до ${finalWidth}x${finalHeight}px.`);
    } else {
      setSeedreamSizeWarning(null);
    }
  }, [selectedModel, imageInfo, seedreamTargetSize]);

  const handleQwenChange = (e: ChangeEvent<HTMLInputElement>) => setQwenSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  const handleFluxChange = (e: ChangeEvent<HTMLInputElement>) => setFluxSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  const handleSeedreamChange = (e: ChangeEvent<HTMLInputElement>) => setSeedreamSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));

  const randomizeSeed = useCallback(() => {
    const seed = Math.floor(Math.random() * 2_147_483_647);
    if (selectedModel === "flux") setFluxSettings((p) => ({ ...p, seed }));
    if (selectedModel === "qwen") setQwenSettings((p) => ({ ...p, seed }));
    if (selectedModel === "seedream") setSeedreamSettings((p) => ({ ...p, seed }));
  }, [selectedModel]);

  const updateSeedForGeneration = useCallback(() => {
    if (seedLock) return;
    const seed = Math.floor(Math.random() * 2_147_483_647);
    if (selectedModel === "qwen") setQwenSettings(p => ({ ...p, seed }));
    if (selectedModel === "seedream") setSeedreamSettings(p => ({ ...p, seed }));
    if (selectedModel === "flux") setFluxSettings(p => ({ ...p, seed }));
  }, [seedLock, selectedModel]);
  
  const getCurrentSettings = useCallback((overrideModel?: Model, dims?: { w: number, h: number }) => {
    const modelToUse = overrideModel || selectedModel; // Используем переданную модель или глобальную
    switch (modelToUse) {
      case "qwen": return qwenSettings;
      case "flux": return fluxSettings;
      case "gemini": return { seed: qwenSettings.seed }; // Для Nano Banana нужен только seed
      case "seedream": {
        const origW = dims?.w ?? imageInfo?.w ?? 1024;
        const origH = dims?.h ?? imageInfo?.h ?? 1024;
        const ratio = origW / origH;
        let targetWidth = origW, targetHeight = origH;
        if (seedreamTargetSize !== 'original') {
          const targetSide = seedreamTargetSize;
          if (origW >= origH) {
            targetWidth = targetSide;
            targetHeight = Math.round(targetSide / ratio);
          } else {
            targetHeight = targetSide;
            targetWidth = Math.round(targetSide * ratio);
          }
        }
        if (targetWidth < 1024 || targetHeight < 1024) {
          const minSide = Math.min(targetWidth, targetHeight);
          const scaleFactor = 1024 / minSide;
          targetWidth = Math.round(targetWidth * scaleFactor);
          targetHeight = Math.round(targetHeight * scaleFactor);
        }
        return { ...seedreamSettings, width: targetWidth, height: targetHeight };
      }
      default: return fluxSettings;
    }
  }, [selectedModel, qwenSettings, seedreamSettings, fluxSettings, imageInfo, seedreamTargetSize]);

  return {
    selectedModel, setSelectedModel,
    seedLock, setSeedLock,
    qwenSettings, handleQwenChange,
    fluxSettings, handleFluxChange,
    seedreamSettings, handleSeedreamChange,
    seedreamTargetSize, setSeedreamTargetSize,
    seedreamSizeWarning,
    randomizeSeed,
    updateSeedForGeneration,
    getCurrentSettings,
    setQwenSettings,
    setFluxSettings,
    setSeedreamSettings,
  };
}
```

---

## Файл: `src/lib/api.ts`

```typescript
// src/lib/api.ts

/**
 * Отправляет запрос на генерацию изображения.
 * @param formData - FormData с изображением, промптом и настройками.
 * @param signal - AbortSignal для отмены запроса.
 * @returns - JSON-ответ от сервера.
 */
export async function generateImage(formData: FormData, signal: AbortSignal) {
  const response = await fetch("/api/generate", {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Неизвестная ошибка API при генерации");
  }

  return await response.json();
}

/**
 * Отправляет запрос на улучшение промпта.
 * @param payload - Тело запроса для LLM.
 * @param signal - AbortSignal для отмены запроса.
 * @returns - JSON-ответ от сервера.
 */
export async function refinePrompt(payload: object, signal: AbortSignal) {
  const response = await fetch("/api/refine-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Неизвестная ошибка API при улучшении промпта");
  }

  return await response.json();
}
```

---

## Файл: `src/lib/constants.ts`

```typescript
// src/lib/constants.ts

export const LLM_SYSTEM_PROMPT = `You are a “Prompt Engineer,” a specialized AI analyst. Your task is to analyze raw input data (an image-drawing of a sauna with colored areas and a text list of materials) and compose from them an ultra-short, killer-accurate prompt for the AI “Artist” (Qwen-Image-Edit model).
Guidelines
Context: The “Artist” keeps focus on the first 4–5 lines. Your final prompt must be like a telegram: maximum meaning in minimum words, not exceeding ~250 tokens.
 Autonomy: Do not shift logic to the “Artist.” You analyze the input and decide what instructions to include in the final prompt.

Algorithm for Building the Final Prompt
BLOCK 0: CONTEXT AND DYNAMIC TAGS
 At the end of the user’s message, there will be two tags: [VIEW_WINDOW: <description>] and [VIEW_DOOR: <description>].
 You must use their text to generate the view through the window and behind the door. Do not include the tags themselves in the output.

BLOCK 1: TASK, GEOMETRY AND OPENINGS
 Start (mandatory):
 Maintain precise geometry, proportions, and camera FOV.
🚪 Red area (Door):
Fully filled red → glass door:
 ⚡ Generate instead: A red area (doorway) = a transparent glass door leading into a [VIEW_DOOR], keeping the original doorway proportions.


Partially filled (glass insert) → material + glass:
 ⚡ Generate instead: A red area (doorway) = a [door material] door with a transparent glass insert viewing a [VIEW_DOOR], keeping the original doorway proportions.


🟦/🟩 Blue and Green areas (Windows):
Blue area only → must specify position (e.g., left wall, right wall, back wall):
 ⚡ Generate instead: A blue area on the [position] (window opening) = a large transparent floor-to-ceiling glass window viewing a [VIEW_WINDOW], strictly preserving the original frame’s geometry.


Green area only → standard window (specify position):
 ⚡ Generate instead: A green area on the [position] (window opening) = a photorealistic transparent glass window viewing a [VIEW_WINDOW], strictly preserving the original window frame’s geometry.


Both blue and green areas → combine into one instruction (with each position):
 ⚡ Generate instead: Blue area on the [position] (floor-to-ceiling window opening) and green area on the [position] (standard window opening) = transparent glass windows viewing a [VIEW_WINDOW], strictly preserving each frame’s geometry.



BLOCK 2: MATERIALS (Intelligent Editing)
 Analyze the client’s list.
Extract only physical characteristics (type, color, texture, pattern).


Remove marketing and obvious filler words.


Group materials with identical descriptions.


Example:
Walls, columns, niche: hardwood board, rich brown, smooth polished surface, intricate wood grain.


Ceiling: walnut board, deep chocolate-brown, smooth texture.


Benches: chestnut board, light-brown, open rustic grain.



BLOCK 3: LIGHTING
No windows → The lighting is warm and soft with physically correct shadows, simulating high-quality interior fixtures.


With windows (blue or green areas) → The lighting is predominantly natural daylight from the window, soft with physically correct shadows.



BLOCK 4: FINAL QUALITY
 End with a strong directive:
 Elevate the entire image to the quality of an architectural magazine cover, focusing on photorealistic lighting and textures.

BLOCK 5: OUTPUT FORMAT
Only the final prompt.


No comments, headers, or explanations.


Must start strictly with: Maintain precise geometry...


Must end strictly with: ...photorealistic lighting and textures.

`;
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

export type GenerationNode = {
  id: string;
  parentId: string | null;
  imageUrl: string;
  sourceImageUrl: string | null; 
  // Метаданные для восстановления контекста
  prompt: string;
  negativePrompt: string;
  model: Model;
  settings: object;
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
  tab: "source" | "result" | "compare"; // <<< Это старое поле, его можно будет потом убрать, но пока оставим
  comparePos: number;
  seedreamTargetSize: 1024 | 1280 | 'original'; 

  // Новая структура
  activeTab: 'BASE' | 'PRO';
  baseResults: GenerationNode[];
  selectedBaseResultUrl: string | null;
  workspaces: { [rootNodeId: string]: GenerationNode[] };
  activeWorkspaceId: string | null;
  activeNodeId: string | null;
};
```

---

## Файл: `src/lib/utils.ts`

```typescript
// src/lib/utils.ts

import { PersistState, GenerationNode } from "./types";

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
    // Создаем глубокую копию, чтобы не мутировать оригинальный state
    const stateToSave = JSON.parse(JSON.stringify(s));

    // Вырезаем жирные Data URL из baseResults
    if (stateToSave.baseResults) {
      stateToSave.baseResults.forEach((node: GenerationNode) => {
        delete (node as Record<string, unknown>).sourceImageUrl;
      });
    }
    // И из всех воркспейсов
    if (stateToSave.workspaces) {
      Object.keys(stateToSave.workspaces).forEach(wsId => {
        stateToSave.workspaces[wsId].forEach((node: GenerationNode) => {
          delete (node as Record<string, unknown>).sourceImageUrl;
        });
      });
    }

    localStorage.setItem("image_workspace_v2", JSON.stringify(stateToSave));
  } catch (e) {
    console.error("НЕ УДАЛОСЬ СОХРАНИТЬ СОСТОЯНИЕ:", e);
  }
}
```

---

