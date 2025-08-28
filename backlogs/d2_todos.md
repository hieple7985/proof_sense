# Day 2 — Backlog (ProofSense)

## Goals (end of Day 2)
- Run minimal NestJS server (health, ingest stub, query stub)
- Run minimal Next.js UI (upload form + query box placeholders)
- Working local runner adapter (Ollama) with ping/version check
- Ingest → chunk → embed → in-memory vector store (MVP)

## Tasks
- Backend (NestJS)
  - Init NestJS structure (src/main.ts, AppModule, HealthController)
  - Stubs: IngestController (accept file, store temp), QueryController (accept query)
  - Config: `.env` loading (PORT, MODEL_RUNNER, OLLAMA_HOST)
  - Scripts: dev (ts-node) and build (tsc) — or JS fallback if TS not ready
- Packages
  - `@proofsense/model-runner`: Ollama client wrapper (`/api/tags`, `/api/generate` ping)
  - `@proofsense/retrieval`: chunker (Markdown/Plaintext), embeddings adapter (CPU-friendly), in-memory vector index
  - `@proofsense/prompts`: base system + answer-with-citations template
- Web (Next.js)
  - Minimal page: upload docs (client-side only for now), query input, results placeholder
  - API calls to backend: `/ingest` and `/query` (no real logic yet)
- Data & Samples
  - Add 2–3 sample contracts (public templates)
  - Create 5–10 synthetic Q/A with expected citations for smoke eval
- Dev Quality
  - `.env.example` with defaults, README updates
  - Basic error handling/logging stubs

## Milestones
- M1: `pnpm --filter @proofsense/backend dev` serves `/healthz`
- M2: `pnpm --filter @proofsense/web dev` shows upload/query UI
- M3: Ollama ping OK; embeddings + in-memory retrieval returns top-K ids

## Nice-to-have (if time remains)
- PDF text extraction (text-based PDFs)
- Simple rerank (cosine sim second-pass)
- Response formatting with citation markers

## Notes
- Prefer TS for backend if setup is smooth; else JS fallback today, TS tomorrow.
- Ollama on M4 as default; do not block on Intel Mac performance.
