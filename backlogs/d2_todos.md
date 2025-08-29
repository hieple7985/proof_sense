# Day 2 — Backlog (ProofSense)

## Goals (end of Day 2)
- Run minimal NestJS server (health, ingest stub, query stub) — DONE
- Run minimal Next.js UI (upload form + query box placeholders) — DONE
- Working local runner adapter (Ollama) with ping/version check — PARTIAL (pkg stub exists; not wired/tested)
- Ingest → chunk → embed → in-memory vector store (MVP) — PARTIAL (chunk util exists; not integrated)

## Tasks
- Backend (NestJS)
  - Init NestJS structure (src/main.ts, AppModule, HealthController) — DONE
  - Stubs: IngestController (accept text for now), QueryController — DONE
  - Config: `.env` loading (PORT, MODEL_RUNNER, OLLAMA_HOST) — PENDING
  - Scripts: dev (ts-node) and build (tsc) — DONE
  - Enable CORS — DONE
- Packages
  - `@proofsense/model-runner`: Ollama client wrapper (`/api/tags` ping) — PARTIAL (ping stub)
  - `@proofsense/retrieval`: chunker (Markdown/Plaintext) — DONE; embeddings adapter + in-memory index — PENDING
  - `@proofsense/prompts`: base system template — DONE
- Web (Next.js)
  - Minimal page: ingest/query UI — DONE
  - API calls to backend: `/ingest` and `/query` — DONE
- Data & Samples
  - Add 2–3 sample contracts — PENDING
  - Create 5–10 synthetic Q/A — PENDING
- Dev Quality
  - `.env.example` with defaults — PENDING
  - Basic error handling/logging stubs — PENDING

## Milestones
- M1: `pnpm --filter @proofsense/backend dev` serves `/healthz` — DONE
- M2: `pnpm --filter @proofsense/web dev` shows upload/query UI — DONE
- M3: Ollama ping OK; embeddings + in-memory retrieval returns top-K ids — PARTIAL (ping stub only)

## Nice-to-have (if time remains)
- PDF text extraction (text-based PDFs)
- Simple rerank (cosine sim second-pass)
- Response formatting with citation markers

## Notes
- Prefer TS for backend if setup is smooth; else JS fallback today, TS tomorrow.
- Ollama on M4 as default; do not block on Intel Mac performance.

---
Day 2 status: Backend + Web MVP achieved; model runner and vector retrieval to be integrated on Day 3.
