# AI Renderer Arena

**A controlled AI rendering and image-editing engine built for 3D sauna configurator workflows.**

[Technical case study](https://www.danil-nikolin.dev/project/ai-renderer-arena) · [Portfolio](https://www.danil-nikolin.dev)

AI Renderer Arena bridges the gap between a structured 3D configurator and a presentation-ready visual.

Instead of treating generation as a one-shot creative task, the system combines builder data, spatial constraints, multiple image models, and a seven-mode editing workspace. Users can generate a base render and then refine materials, objects, style, and selected regions without restarting the entire workflow.

The project was developed as the intelligence layer for a sauna builder and as a standalone engineering prototype for controlled generative pipelines.

## Core workflow

1. Receive the builder sketch, scene data, and selected materials
2. Convert raw inputs into a structured technical prompt
3. Route the task to the appropriate image model
4. Generate a base visualization while preserving scene constraints
5. Continue through a non-destructive editing workflow
6. Add textures, backgrounds, styles, and 2D or 3D objects
7. Store assets, sessions, usage records, and generation history

## Seven-mode editor

The Pro Editor provides specialized workflows for different types of changes:

- **General edit** — free-form image refinement
- **Texture replacement** — replace a selected material using text or a reference image
- **Background replacement** — change the environment while preserving the primary scene
- **Style transfer** — apply a visual style without rebuilding the composition
- **2D object insertion** — position image assets within the render
- **3D object insertion** — prepare and insert GLB/GLTF assets
- **Multi-pointer editing** — place spatial anchors and attach instructions to specific regions

Each mode maintains its own input state and routes the request through a specialized processing pipeline.

## Architecture highlights

### LLM prompt architect

Builder input can contain incomplete descriptions, UI labels, material selections, and scene metadata. An orchestration layer converts this mixed input into a clean technical prompt for the selected rendering model.

The model is used for interpretation and prompt construction, while application code remains responsible for routing, validation, persistence, and access control.

### Model-agnostic routing

Different tasks require different generation capabilities. The backend abstracts provider-specific APIs and routes generation, inpainting, style transfer, or object insertion to the appropriate model pipeline.

Supported workflows include models from the Flux, Qwen, Gemini / Nano Banana, and Seedream families.

### Spatial intent mapping

Users can place arrows and control points directly on the image. Their coordinates are converted into structured edit instructions, allowing the pipeline to distinguish between general requests and targeted changes such as “replace this wall texture” or “place a heater here.”

### Hybrid 3D/2D photobooth

Three.js is used to load and position 3D assets in a client-side photobooth. The user can adjust object rotation and camera framing before producing a reference pass for the image-editing pipeline.

This creates a practical bridge between reusable 3D catalog assets and AI-generated 2D renders.

### Stateful editing sessions

The application preserves source images, generated variants, editing history, active tools, and comparison state. Users can continue refining an existing result instead of treating every generation as an isolated request.

### Asset and operations layer

An administrative asset library manages textures, images, and 3D models. Generation requests and usage are recorded so expensive model calls can be tracked and limited.

## Reliability considerations

- Builder geometry and selected materials are treated as explicit constraints
- Targeted edits isolate the requested area to reduce unwanted scene changes
- Server-side credentials remain outside the browser
- Uploaded assets are validated before entering the editing workflow
- Usage limits protect expensive multi-step generation flows
- Generation history provides an operational audit trail
- Provider failures are handled through explicit loading, error, and retry states

## Tech stack

| Layer | Technology |
| --- | --- |
| Application | Next.js 16, React 19, TypeScript |
| Data and authentication | Supabase Auth, PostgreSQL |
| Storage | Supabase Storage, S3-compatible object storage |
| AI orchestration | OpenAI GPT models |
| Image generation | FAL.ai, Flux, Qwen, Gemini / Nano Banana, Seedream |
| 3D workflow | Three.js, GLB/GLTF assets |
| Image processing | Sharp |
| Validation | Zod |
| Database changes | node-pg-migrate |
| UI | Tailwind CSS |

## Project status

AI Renderer Arena is a working engineering prototype and integration module. It demonstrates controlled image-generation pipelines, spatial editing interfaces, model routing, asset management, and hybrid 3D/2D workflows.

## Local development

```bash
npm install
npm run dev
```

Database migrations can be applied with:

```bash
npm run migrate:dev
```

The application requires Supabase, storage, and AI-provider configuration through environment variables. Never commit local credentials or infrastructure configuration files.

---

Built end to end by [Danil Nikolin](https://www.danil-nikolin.dev).
