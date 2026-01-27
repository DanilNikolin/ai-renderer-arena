# Project Audit: ai-renderer-arena

## 1. Repository Overview
This repository contains a **Next.js 15** web application designed as an AI rendering platform. It features a dual-API architecture (internal and external) for image generation and a sophisticated frontend component for transforming 3D models into 2D input artifacts. The project is structured using the App Router, with a clear separation between API logic, UI components (`src/components`), and core utilities (`src/lib`). Database migrations are managed via `node-pg-migrate`.

## 2. Tech Stack (Actual)
*   **Language**: TypeScript
*   **Framework**: Next.js 16.1.5, React 19.2.4
*   **Styling**: Tailwind CSS 4
*   **Database**: PostgreSQL (`pg` driver, connection pooling via `src/lib/db.ts`)
*   **AI / Image Models**:
    *   **Orchestrator**: OpenAI (`gpt-5-mini`) via `openai` SDK.
    *   **Image Generators** (via `@fal-ai/client`):
        *   Qwen (Image Edit)
        *   Flux (Flux 2 Pro)
        *   Seedream (v4.5)
        *   Gemini (Nano-Banana)
    *   **Vision**: Shared OpenAI Vision capabilities for prompt engineering.
*   **Graphics & 3D**: Three.js (`three` + `three-stdlib`) used for client-side model visualization and snapshotting.
*   **Image Processing**: `sharp` (server-side analysis), Native Canvas API (client-side).
*   **Storage**: S3-compatible storage (MinIO/AWS) via `@aws-sdk/client-s3`.

## 3. Input Artifacts
The system processes three distinct types of inputs:
1.  **Images**:
    *   Formats: PNG, JPEG, JPG, WEBP.
    *   Sources: Multipart/form-data uploads or remote URLs (JSON body).
    *   Usage: Used as reference/source images (inpainting) and for vision-based prompt analysis.
2.  **3D Models**:
    *   Formats: `.glb`, `.gltf`, `.obj`.
    *   Processing: Handled purely client-side in `PhotoboothModal.tsx`.
3.  **Text**:
    *   User Prompts (`description_prompt`, `improvement_prompt`).
    *   Configurable Views (`windowView`, `doorView` hints).
    *   Material lists (implied by System Prompt logic).

## 4. Image Processing Layer
*   **Client-Side (3D to 2D)**:
    *   `src/components/editor/PhotoboothModal.tsx` implements a "Photo Booth".
    *   **Snapshot Logic**: Renders two distinct passes:
        1.  **Taget Map**: Everything rendered via a specific material (e.g., red) to create masks/silhouettes.
        2.  **Reference Object**: Clean render on a white background with auto-zoom (`Camera.lookAt` + bounding box calculation).
    *   Output: Blobs generated via `canvas.toBlob`.
*   **Server-Side**:
    *   **Size Detection**: `src/lib/image.server.ts` uses `sharp` to read metadata (width/height) from buffers without full decoding.
    *   **Format Inference**: Custom `inferExt` helper detects format from Content-Type headers or URL signatures.
    *   **Resize Prevention**: Explicitly passes original dimensions to Fal.ai models (e.g., Qwen) to prevent unwanted downscaling.

## 5. Prompt Assembly Logic
*   **Dynamic Construction**:
    *   Location: `src/app/api/external/generate/route.ts`.
    *   Visual Hints: Supports `windowView` and `doorView` variables.
    *   Randomization: Parses pipe-separated values (`|`) in `windowView` to select a single random environment description.
*   **Vision-Augmented Assembly**:
    *   Combines: User Text + Selected Visual Hints + Input Image (Vision).
    *   Structure:
        ```text
        <User Text>
        [VIEW_WINDOW: <Selected Window Description>]
        [VIEW_DOOR: <Door Description>]
        ```
    *   This composite is sent to the LLM (OpenAI) to generate the final technical prompt.

## 6. Generation Pipeline
The pipeline is linear and synchronous per request:
1.  **Ingest**: Receive Request (Multipart or JSON) -> Validate API Key (`INTEGRATION_API_KEY`) -> Validate Inputs.
2.  **Audit Start**: Insert record into `external_request_audit` with status `'processing'`.
3.  **Analyze**: Detect source image dimensions.
4.  **Refine (LLM)**:
    *   Input: System Prompt + Composite Text + Source Image.
    *   Output: A "Killer-accurate" technical prompt (~250 tokens) strictly following "Golden Rule" (Color Code: Red=Door, Green=Window).
5.  **Generate (AI)**:
    *   Call Fal.ai endpoint specific to the selected model (Qwen/Flux/Seedream/Gemini).
    *   Pass Refined Prompt + Source Image + Params (Seed, Guidance, Steps).
6.  **Download & Store**:
    *   Fetch result from Fal.ai CDN.
    *   Save to internal S3 storage with timestamped filename.
7.  **Audit Finish**: Update DB record with `'ok'` status, execution time, and file URLs.

## 7. LLM Layer
*   **Role**: "Prompt Engineer" & "Architectural Analyst".
*   **Implementation**: `src/app/api/external/generate/route.ts`.
*   **Model**: Requests `gpt-5-mini`.
*   **System Prompt (`src/lib/constants.ts`)**:
    *   **Persona**: Specialized AI Analyst.
    *   **Logic**:
        *   **Golden Rule**: Detect Red/Green/Blue colors in the input image.
        *   **Conditional Logic**: IF Red -> Use `DOOR_SCENE`. IF Green/Blue -> Use `WINDOW_SCENE`.
        *   **Output**: Strict technical prompt, no markdown conversation.

## 8. Parsing & Post-Processing
*   **LLM Output**: Treated as raw text (`refinedTemplate`). No JSON schema enforcement, relies on System Prompt strictness ("Must start strictly with...", "No comments").
*   **Fal.ai Output**: Parsed as JSON to find `images[0].url` or `image.url`.
*   **Error Handling**: If Fal.ai returns non-200 or missing image, the pipeline aborts and updates the Audit Log.

## 9. Orchestration & Control Flow
*   **Type**: Request-Response (Synchronous to client).
*   **State**: Stateless API, but state is tracked persistently in Postgres (`external_request_audit`).
*   **Logic**:
    *   `src/app/api/external/generate/route.ts`: Contains the full business logic (Auth -> LLM -> AI -> Storage -> DB).
    *   `src/app/api/generate/route.ts`: A lighter version (internal use), possibly identifying lack of code reuse between internal/external routes.

## 10. Core Modules

| Module | Path | Responsibilities |
| :--- | :--- | :--- |
| **External Gen API** | `src/app/api/external/generate/route.ts` | Public API, Auth, Audit Logging, LLM Integration, Fal.ai Orchestration. |
| **Internal Gen API** | `src/app/api/generate/route.ts` | Simplified generation logic (likely for frontend testing), lacks Audit/LLM steps. |
| **Photobooth** | `src/components/editor/PhotoboothModal.tsx` | 3D Viewer, Snapshot logic, Scene/Camera manipulation. |
| **Database** | `src/lib/db.ts` | Postgres connection pool configuration. |
| **Storage** | `src/lib/storage.ts` | S3 upload/save logic (inferred). |
| **Constants** | `src/lib/constants.ts` | Centralized System Prompts. |
| **Image Server** | `src/lib/image.server.ts` | Server-side image analysis (Sharp). |

## 11. Config & Runtime
*   **Runtime**: Node.js (`export const runtime = "nodejs"`).
*   **Environment Variables**:
    *   Keys: `FAL_KEY`, `OPENAI_API_KEY`, `INTEGRATION_API_KEY`.
    *   Infrastructure: `DATABASE_URL`, `S3_...` (implied).
*   **Modes**:
    *   `dynamic = "force-dynamic"` enforced on API routes to bypass Next.js caching.

## 12. Error Handling
*   **Audit Logging**: The primary mechanism for tracking failure. Errors (Fal failures, Download failures) are written to the `error_message` column in DB.
*   **Client Response**:
    *   Validation Errors: 400 (Missing fields, unsupported types).
    *   Auth Errors: 401.
    *   Upstream Errors: 502 (Fal.ai failure, Download failure).
*   **Console**: Stack traces logged to server console (detailed).

## 13. Performance Notes
*   **Synchronous Chain**: The External API holds the HTTP connection open while waiting for OpenAI (~seconds) AND Fal.ai (~seconds). This is a potential scalability bottleneck for high concurrency or long-running generations.
*   **Timeouts**:
    *   `fetchWithTimeout` implemented: 30s for Fal.ai, 20s for downloads.
*   **Memory**: Image buffers are loaded into memory (`Buffer.from`) for analysis and uploading. Large files could impact Node.js heap.

## 14. Known Limitations (Code-level)
*   **Hardcoded Model Alias**: `gpt-5-mini` is hardcoded; if this model ID changes or is invalid, the pipeline breaks.
*   **Code Duplication**: Significant logic overlap between `api/generate` and `api/external/generate`. External has Audit/LLM, Internal does not.
*   **Prompt Fallbacks**: Text View hints (`windowView`) have hardcoded default strings in the code.
*   **Wait Times**: No webhook/callback architecture; client must wait for full generation cycle.

## 15. System Invariants (Code-level)
These conditions effectively act as law within the system execution:
*   **Secure Entry**: The External API logic for generation *cannot* be reached without an `x-api-key` header exactly matching the `INTEGRATION_API_KEY` environment variable.
*   **Dimension Authority**: If the system detects image dimensions from the source file (via `sharp`), these dimensions are *invariably* passed to the AI model params (specifically for Qwen and Seedream), overriding any model defaults.
*   **Data Isolation**: Client-side 3D models never touch the server logic; only their 2D rendered snapshots are transmitted.
*   **Audit Attempt**: Every request to the external API initiates a DB transaction to create an audit record before any AI processing begins.

## 16. Pipeline Guarantees
*   **Context Preservation**: The exact string returned by the LLM ("Refined Template") is guaranteed to be the input prompt for the Image Generation step.
*   **Asset Persistence**: No successful generation response is returned to the client without first confirming the file has been saved to the internal S3 storage; the system does not rely on ephemeral external vendor links.
*   **Format Normalization**: Regardless of input format (Multipart or JSON url), the internal pipeline normalizes images to Base64 Data URLs before handing them to the Vision LLM.

## 17. Failure Modes & Fallbacks
*   **Soft Failures (Non-Blocking)**:
    *   **Audit Insert**: If the database is unreachable for the initial audit log insert, the error is logged to the console, but the generation pipeline *proceeds* (Audit ID becomes `null`).
    *   **Randomization**: If `windowView` string parsing fails or contains empty segments, the system degrades gracefully to using the full string or a valid segment.
*   **Hard Failures (Aborting)**:
    *   **Vendor Errors**: A non-200 response from Fal.ai results in an immediate 502 response to the client.
    *   **Download Timeouts**: If the generated image cannot be downloaded from the generic CDN within 20 seconds, the request aborts with a 502.
    *   **Missing API Keys**: Absence of server-side keys (`FAL_KEY`, `OPENAI_API_KEY`) triggers an immediate 500 error.

## 18. Non-Trivial Engineering Decisions
*   **Synchronous Orchestration**:
    *   **Decision**: The multi-step pipeline (Auth -> Audit -> LLM -> Gen -> Save -> Audit-Update) is implemented as a single synchronous HTTP handler.
    *   **Implication**: Simplifies state management and error propagation but requires the client to hold a connection open for the full duration (15-40s).
*   **Prompt Engineering as Code**:
    *   **Decision**: Complex logic for "Active Color" detection (Red=Door, etc.) is implemented via a rigorous System Prompt ("The Golden Rule") rather than imperative computer vision code.
    *   **Implication**: Shifts logic maintenance from TypeSript to English/Prompt Engineering.
*   **Dual-Pass Client Rendering**:
    *   **Decision**: The Photobooth component renders the scene twice per snapshot action—once for the detailed reference and once for the "Target Map" (red silhouette).
    *   **Implication**: Ensures perfect alignment between the mask and the reference image without complex server-side alignment logic.
