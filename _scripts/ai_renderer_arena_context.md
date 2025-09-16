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
│   └── components
│       └── ImageWorkspace.tsx
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

@import "tailwindcss";
@tailwind base;
@tailwind components;
@tailwind utilities;

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
// D:\Work\Image test for 3Dims (3 models)\ai-renderer-arena\src\app\api\generate\route.ts

import { NextRequest, NextResponse } from "next/server";

// ИЗМЕНЕНИЕ №1: Интерфейс теперь должен учитывать ОБА варианта
interface FalRequestBody {
  prompt: string;
  image_url?: string;      // Для Qwen, Flux
  image_urls?: string[];   // Для Nano Banana
  negative_prompt?: string;
  seed?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  safety_tolerance?: number;
}

export async function POST(req: NextRequest) {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    return NextResponse.json({ error: "Ключ API для fal.ai не найден" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const model = formData.get("model") as string | null;
    const prompt = formData.get("prompt") as string | null;
    const negativePrompt = formData.get("negative_prompt") as string | null;
    const imageFile = formData.get("image") as File | null;
    const settingsStr = formData.get("settings") as string | null;

    if (!model || !prompt || !imageFile) {
      return NextResponse.json({ error: "Отсутствуют обязательные поля" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imageUrl = `data:${imageFile.type};base64,${imageBuffer.toString("base64")}`;

    let endpointUrl: string;
    const settings = settingsStr ? JSON.parse(settingsStr) : {};

    // Базовое тело запроса без данных об изображении
    const body: FalRequestBody = {
      prompt: prompt,
    };
    if (negativePrompt) {
      body.negative_prompt = negativePrompt;
    }

    // ИЗМЕНЕНИЕ №2: Динамически добавляем поле с изображением в нужном формате
    switch (model) {
      case "qwen":
        endpointUrl = 'https://fal.run/fal-ai/qwen-image-edit';
        body.image_url = imageUrl; // <--- Отправляем как строку
        body.guidance_scale = settings.guidance_scale;
        body.num_inference_steps = settings.num_inference_steps;
        body.seed = settings.seed;
        break;
      case "flux":
        endpointUrl = 'https://fal.run/fal-ai/flux-pro/kontext';
        body.image_url = imageUrl; // <--- Отправляем как строку
        body.guidance_scale = settings.guidance_scale;
        body.safety_tolerance = settings.safety_tolerance;
        body.seed = settings.seed;
        break;
      
      case "gemini":
        endpointUrl = 'https://fal.run/fal-ai/nano-banana/edit';
        body.image_urls = [imageUrl]; // <--- Отправляем как массив
        if (settings.seed) {
            body.seed = settings.seed;
        }
        break;

      default:
        return NextResponse.json({ error: `Модель '${model}' не поддерживается` }, { status: 400 });
    }
    
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText); 
      return NextResponse.json({ error: `Ошибка API: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const finalImageUrl = data.images?.[0]?.url;

    if (!finalImageUrl) {
        console.error("API did not return an image URL. Response:", data); 
        return NextResponse.json({ error: "API не вернуло изображение" }, { status: 500 });
    }
    
    return NextResponse.json({ imageUrl: finalImageUrl });

  } catch (e: any) {
    console.error("Server-side error:", e); 
    return NextResponse.json({ error: e.message || "Неизвестная ошибка на сервере" }, { status: 500 });
  }
}
```

---

## Файл: `src/app/api/refine-prompt/route.ts`

```typescript
// src/app/api/refine-prompt/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Ключ API для OpenAI не найден" }, { status: 500 });
  }

  try {
    const formData = await req.formData();

    const rawPrompt = formData.get("prompt") as string | null;
    const modelName = formData.get("model") as string | null;
    const imageFile = formData.get("image") as File | null;
    const systemPrompt = formData.get("system_prompt") as string | null;
    const temperatureStr = formData.get("temperature") as string | null;
    const topPStr = formData.get("top_p") as string | null;
    const maxTokensStr = formData.get("max_completion_tokens") as string | null; // приходит так, но ниже мапим на max_tokens

    if (!rawPrompt || !modelName || !systemPrompt) {
      return NextResponse.json({ error: "Отсутствуют обязательные поля: prompt, model, system_prompt" }, { status: 400 });
    }

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: [{ type: "text", text: `Refine this prompt: "${rawPrompt}"` }] },
    ];

    if (imageFile) {
      // Убедимся, что модель поддерживает vision, прежде чем добавлять картинку.
      // Это примерная логика; можно сделать более строгую проверку.
      if (!modelName.includes("4o")) {
         return NextResponse.json({ error: `Модель '${modelName}' не поддерживает изображения.` }, { status: 400 });
      }
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Image = imageBuffer.toString("base64");
      (messages[1].content as any[]).push({
        type: "image_url",
        image_url: { url: `data:${imageFile.type};base64,${base64Image}` },
      });
    }

    const temperature = temperatureStr ? parseFloat(temperatureStr) : undefined;
    const top_p = topPStr ? parseFloat(topPStr) : undefined;
    const max_tokens = maxTokensStr ? parseInt(maxTokensStr, 10) : undefined; // ✔ правильный ключ для Chat Completions

    const response = await openai.chat.completions.create({
        model: modelName,
        messages,
        temperature,
        top_p,
        max_completion_tokens: max_tokens, // <--- Правильный ключ, который требует API
        });

    const refinedPrompt = response.choices[0]?.message?.content?.trim();

    if (!refinedPrompt) {
      console.error("Full OpenAI Response on Empty Content:", JSON.stringify(response, null, 2));
      const finishReason = response.choices[0]?.finish_reason || "unknown_reason";
      const detailedError = `OpenAI не вернула улучшенный промпт. Причина завершения: '${finishReason}'. Проверь логи сервера для деталей.`;
      return NextResponse.json({ error: detailedError }, { status: 500 });
    }

    return NextResponse.json({ refinedPrompt });
  } catch (e: any) {
    console.error("OpenAI API Error:", e);
    const errorMessage = e.response?.data?.error?.message || e.message || "Неизвестная ошибка на сервере";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
```

---

## Файл: `src/components/ImageWorkspace.tsx`

```typescript
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
} from "react";

/** ---------- types & const ---------- */
type Model = "gemini" | "qwen" | "flux";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"];

type QwenSettings = { guidance_scale: number; num_inference_steps: number; seed: number };
type FluxSettings = { guidance_scale: number; safety_tolerance: number; seed: number };

type PersistState = {
  prompt: string;
  negativePrompt: string;
  selectedModel: Model;
  qwenSettings: QwenSettings;
  fluxSettings: FluxSettings;
};

/** ---------- utils ---------- */
function cx(...s: (string | false | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

function readImageDims(file: File): Promise<{ w: number; h: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

function loadPersist(): PersistState | null {
  try {
    const raw = localStorage.getItem("image_workspace_v2");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePersist(s: PersistState) {
  try {
    localStorage.setItem("image_workspace_v2", JSON.stringify(s));
  } catch {}
}

/** ---------- small UI atoms ---------- */
const Label: React.FC<{ title: string; right?: React.ReactNode; className?: string }> = ({ title, right, className }) => (
  <div className={cx("flex items-center justify-between mb-1.5", className)}>
    <span className="text-xs text-gray-300">{title}</span>
    {right}
  </div>
);

const Slider: React.FC<{
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

/** ---------- main ---------- */
export default function ImageWorkspace() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [rawPrompt, setRawPrompt] = useState(""); // <-- Для "мусорного" промта
  const [isRefining, setIsRefining] = useState(false); // <-- Загрузка LLM
  const [refineError, setRefineError] = useState<string | null>(null); // <-- Ошибка LLM
  const [sendImageToLlm, setSendImageToLlm] = useState(true); // <-- Состояние чекбокса
  const [showRefiner, setShowRefiner] = useState(false); // <-- Для сворачивания блока
  const [llmSettings, setLlmSettings] = useState({
  model: 'gpt-5-mini' as 'gpt-5-mini' | 'gpt-5-nano',
  systemPrompt: `You are an expert prompt engineer for an instruction-based image editing model. Your goal is to convert the user's short, messy request into a detailed, clear, and effective instruction. The user will provide a source image of a sauna and a short text. Your output must be a single, concise instruction in English. Focus on photorealism and accurate material descriptions. For example, if the user writes 'стены кедр, полки осина', you should output 'Change the vertical wall panels to photorealistic Canadian cedar wood, and make the benches from smooth, light aspen wood'.`,
  temperature: 0.7,
  topP: 1,
  maxCompletionTokens: 200,
});
  const [negativePrompt, setNegativePrompt] = useState("blurry, ugly, deformed, text, watermark");
  const [showNeg, setShowNeg] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>("flux");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ w: number; h: number } | null>(null);
  const [tab, setTab] = useState<"source" | "result" | "compare">("source");
  const [comparePos, setComparePos] = useState(50); // %
  const [seedLock, setSeedLock] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const dropRef = useRef<HTMLLabelElement | null>(null);

  // settings
  const [qwenSettings, setQwenSettings] = useState<QwenSettings>({
    guidance_scale: 4,
    num_inference_steps: 30,
    seed: 0,
  });
  const [fluxSettings, setFluxSettings] = useState<FluxSettings>({
    guidance_scale: 3.5,
    safety_tolerance: 2,
    seed: 0,
  });

  const handleQwenChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQwenSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };
  const handleFluxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFluxSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };

  // persist
  useEffect(() => {
    const p = loadPersist();
    if (!p) return;
    setPrompt(p.prompt ?? "");
    setNegativePrompt(p.negativePrompt ?? "blurry, ugly, deformed, text, watermark");
    setSelectedModel(p.selectedModel ?? "flux");
    setQwenSettings(p.qwenSettings ?? { guidance_scale: 4, num_inference_steps: 30, seed: 0 });
    setFluxSettings(p.fluxSettings ?? { guidance_scale: 3.5, safety_tolerance: 2, seed: 0 });
  }, []);

  useEffect(() => {
    savePersist({
      prompt,
      negativePrompt,
      selectedModel,
      qwenSettings,
      fluxSettings,
    });
  }, [prompt, negativePrompt, selectedModel, qwenSettings, fluxSettings]);

  // revoke URL
  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  // keyboard shortcuts
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
    setLlmSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const onRefinePrompt = async () => {
  if (!rawPrompt.trim()) return;
  setIsRefining(true);
  setRefineError(null);
  abortControllerRef.current = new AbortController();

  const formData = new FormData();
  formData.append("prompt", rawPrompt);
  
  // Отправляем все настройки из объекта llmSettings
  formData.append("model", llmSettings.model);
  formData.append("system_prompt", llmSettings.systemPrompt);
  formData.append("temperature", llmSettings.temperature.toString());
  formData.append("top_p", llmSettings.topP.toString());
  formData.append("max_completion_tokens", llmSettings.maxCompletionTokens.toString());

  if (sendImageToLlm && sourceFile) {
    formData.append("image", sourceFile);
  }
  
  try {
    const response = await fetch("/api/refine-prompt", {
      method: "POST",
      body: formData,
      signal: abortControllerRef.current.signal,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Неизвестная ошибка API");
    }
    const data = await response.json();
    setPrompt(data.refinedPrompt);
    setShowRefiner(false);
  } catch (e: any) {
    if (e.name === "AbortError") {
      setRefineError("Улучшение отменено.");
    } else {
      setRefineError(e.message);
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

  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return fail(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB} MB.`);
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return fail("Неверный тип файла. Используйте PNG, JPEG или WebP.");
    }
    setError(null);
    setResultUrl(null);
    setTab("source");
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
    const items = (e.clipboardData || (window as any).clipboardData).items;
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

  useEffect(() => {
    const handler = (ev: ClipboardEvent) => onPaste(ev);
    window.addEventListener("paste", handler as any);
    return () => window.removeEventListener("paste", handler as any);
  }, []);

  const onClear = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceFile(null);
    setSourceUrl(null);
    setResultUrl(null);
    setError(null);
    setPrompt("");
    setImageInfo(null);
    setTab("source");
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
  };

  const onGenerate = async () => {
    if (!isReadyToGenerate || !sourceFile) return;
    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append("image", sourceFile);
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", selectedModel);

    let settings: any = {};
    if (selectedModel === "qwen") settings = qwenSettings;
    if (selectedModel === "flux") settings = fluxSettings;

    // если сид не залочен — подкинем новый для разнообразия
    if (!seedLock) {
      const seed = Math.floor(Math.random() * 2_147_483_647);
      settings = { ...settings, seed };
      if (selectedModel === "flux") setFluxSettings((p) => ({ ...p, seed }));
      if (selectedModel === "qwen") setQwenSettings((p) => ({ ...p, seed }));
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
      setResultUrl(data.imageUrl);
      setTab("result");
    } catch (e: any) {
      if (e.name === "AbortError") {
        setError("Генерация отменена.");
      } else {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6" onKeyDown={onKeyDown} tabIndex={0}>
      {/* ---------- Sidebar ---------- */}
      <aside className="bg-gray-850 border border-gray-800 rounded-xl p-4 lg:p-5 sticky top-6 h-fit">
        {/* file */}
        <div className="space-y-2">
          <Label
            title="Исходное изображение"
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
                <p className="text-cyan-400 text-sm font-medium truncate">{sourceFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(sourceFile.size / 1024 / 1024).toFixed(2)} MB • {sourceFile.type.replace("image/", "").toUpperCase()}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Перетащи или нажми, чтобы выбрать</p>
                <p className="text-xs text-gray-500">PNG, JPEG, WebP • до {MAX_FILE_SIZE_MB}MB • Ctrl+V из буфера</p>
              </div>
            )}
            <input id="image-upload" type="file" className="hidden" accept={ACCEPTED_FILE_TYPES.join(",")} onChange={onFileChange} />
          </label>
        </div>


        {/* prompt refiner */}
          <div className="mt-5 space-y-3 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
            <button type="button" onClick={() => setShowRefiner(v => !v)} className="w-full text-left text-sm font-medium text-cyan-400">
              {showRefiner ? "▼ Скрыть «Промпт-Инженер»" : "► Открыть «Промпт-Инженер»"}
            </button>
            {showRefiner && (
              <div className="pt-2 space-y-4">
                <div>
                  <Label title="1. Сырая идея" />
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
                    value={llmSettings.systemPrompt}
                    onChange={handleLlmSettingsChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label title="Модель" />
                    <div className="flex items-center gap-2 rounded-lg bg-gray-950 p-1">
                      {(['gpt-5-mini', 'gpt-5-nano'] as const).map(model => (
                        <button
                          key={model}
                          onClick={() => setLlmSettings(p => ({ ...p, model }))}
                          className={`w-full px-2 py-1 text-xs rounded-md transition-colors ${
                            llmSettings.model === model ? 'bg-cyan-600 text-white' : 'hover:bg-gray-800'
                          }`}
                        >
                          {model.replace('gpt-5-', '')}
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
                  <Slider label="Temperature" name="temperature" value={llmSettings.temperature} min={0} max={2} step={0.1} onChange={handleLlmSettingsChange} />
                  <Slider label="Top P" name="topP" value={llmSettings.topP} min={0} max={1} step={0.05} onChange={handleLlmSettingsChange} />
                  <Slider label="Max Tokens" name="maxCompletionTokens" value={llmSettings.maxCompletionTokens} min={50} max={1000} step={10} onChange={handleLlmSettingsChange} />
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
                  <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded-md">{refineError}</p>
                )}
              </div>
            )}
          </div>

        {/* prompt */}
        <div className="mt-5 space-y-2">
          <Label
            title="Инструкция"
            right={
              <span className="text-[10px] text-gray-500">{prompt.trim().length || 0}</span>
            }
          />
          <textarea
          
            rows={5}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Напр.: Change the walls to photorealistic Canadian cedar..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowNeg((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-200 transition underline underline-offset-4"
          >
            {showNeg ? "Скрыть негативный промпт" : "Показать негативный промпт"}
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
          <div className="grid grid-cols-3 gap-3">
            {(["flux", "qwen", "gemini"] as Model[]).map((m) => {
              const isActive = selectedModel === m;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedModel(m)}
                  className={cx(
                    "py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200",
                    isActive
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30" // <--- ИЗМЕНЕНО
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
              <Slider label="Guidance scale" value={qwenSettings.guidance_scale} min={1} max={10} step={0.1} onChange={handleQwenChange} name="guidance_scale" />
              <Slider label="Inference Steps" value={qwenSettings.num_inference_steps} min={10} max={60} step={1} onChange={handleQwenChange} name="num_inference_steps" />
              <Slider label="Seed" value={qwenSettings.seed} min={0} max={2147483647} step={1} onChange={handleQwenChange} name="seed" />
            </>
          )}

          {selectedModel === "flux" && (
            <>
              <Slider label="Guidance scale (CFG)" value={fluxSettings.guidance_scale} min={0} max={10} step={0.1} onChange={handleFluxChange} name="guidance_scale" />
              <Slider label="Safety Tolerance" value={fluxSettings.safety_tolerance} min={0} max={10} step={0.5} onChange={handleFluxChange} name="safety_tolerance" info="Большее — строже safety и потенциальный кроп." />
              <Slider label="Seed" value={fluxSettings.seed} min={0} max={2147483647} step={1} onChange={handleFluxChange} name="seed" />
            </>
          )}

          {selectedModel === "gemini" && <p className="text-xs text-gray-500">Для Gemini пока нет доп. параметров.</p>}
        </div>

        {/* actions */}
        <div className="mt-5 space-y-3">
          <button
            onClick={onGenerate}
            disabled={!isReadyToGenerate}
            className={cx(
              "w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition",
              isReadyToGenerate ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"
            )}
            title="Ctrl/Cmd+Enter — тоже сработает"
          >
            {isLoading ? "Генерация..." : "Сгенерировать"}
          </button>

          <div className="flex items-center justify-between">
            {isLoading ? (
              <button onClick={onCancel} className="text-xs text-red-400 hover:text-red-300">
                Отменить (Esc)
              </button>
            ) : (
              <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-200">
                Очистить
              </button>
            )}
            {sourceFile && (
              <span className="text-[11px] text-gray-500">{sourceFile.type.replace("image/", "").toUpperCase()}</span>
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

      {/* ---------- Canvas ---------- */}
      <section className="space-y-4">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {isLoading ? "Обработка…" : resultUrl ? "Готово" : "Ожидает запуска"}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-1 flex">
              {(["source", "result", "compare"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cx(
                    "px-3 py-1.5 text-xs rounded-md",
                    tab === t ? "bg-gray-800 text-gray-100" : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  {t === "source" ? "Исходник" : t === "result" ? "Результат" : "Сравнить"}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!sourceUrl) return;
                const link = document.createElement("a");
                link.href = sourceUrl;
                link.download = sourceFile?.name || "source.png";
                link.click();
              }}
              disabled={!sourceUrl}
              className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
            >
              Скачать исходник
            </button>

            <button
              onClick={() => {
                if (!resultUrl) return;
                const link = document.createElement("a");
                link.href = resultUrl;
                link.download = "result.png";
                link.click();
              }}
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
            {tab === "source" ? "Исходное изображение" : tab === "result" ? "Результат" : "Сравнение (двигай слайдер)"}
          </div>

          <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">

            {/* loading overlay */}
            {isLoading && <div className="absolute inset-0 bg-gray-800/50 animate-pulse" aria-label="loading" />}

            {/* source */}
            {tab !== "result" && (
              sourceUrl ? (
                <img src={sourceUrl} alt="Source" className="absolute inset-0 w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">Загрузите изображение</div>
              )
            )}

            {/* result */}
            {tab !== "source" && (
              resultUrl ? (
                tab === "compare" ? (
                  <>
                    <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain" style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }} />
                    <div className="absolute inset-0 pointer-events-none border-l-2 border-cyan-500" style={{ left: `${comparePos}%` }} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={comparePos}
                      onChange={(e) => setComparePos(Number(e.target.value))}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[60%] h-2 bg-gray-700 rounded-lg appearance-none accent-cyan-500"
                    />
                  </>
                ) : (
                  <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain" />
                )
              ) : (
                tab !== "source" && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">Пока пусто</div>
                )
              )
            )}
          </div>
        </div>

        <div className="text-[11px] text-gray-500">
          Лайфхак: короткий промпт → выбери модель → Ctrl/Cmd+Enter. Вставка из буфера работает.
        </div>
      </section>
    </div>
  );
}

```

---

