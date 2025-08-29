# ProofSense Monorepo

- Apps:
  - `apps/backend` — NestJS API (ingest, retrieval, generation, citations, finetune)
  - `apps/web` — Next.js minimal UI
- Packages:
  - `packages/model-runner` — adapters for local (Ollama/LM Studio) and optional remote GPU runners
  - `packages/retrieval` — chunking, embeddings, in-memory vector index with de-dup
  - `packages/prompts` — prompt templates and orchestration chains
  - `packages/eval` — evaluation scripts and metrics

## Getting Started

1) Install pnpm (or use npm/yarn; workspace files assume pnpm)
2) Install deps:
```
pnpm install
```
3) Run backend:
```
pnpm --filter @proofsense/backend dev
```
4) Run web:
```
pnpm --filter @proofsense/web dev
```

## Current Status (Day 4/5)

- Backend: Health endpoint, ingest/query with retrieval, answer synthesis (Ollama optional)
- Web: Upload/query UI with loading states, shows contexts and citations
- Retrieval: Chunk → embed → in-memory index with de-dup and rerank
- Samples: 3 sample contracts and 5 QA items in `samples/`

## Sample Usage

1) Ingest sample contracts:
   - Copy content from `samples/contracts/contractA.md` into web UI
   - Or POST to `/ingest` with `{datasetId, name, text}`

2) Query with synthesis:
   - POST to `/query` with `{datasetId, query, synthesize: true}`
   - Returns `{answer, contexts, citations}`

3) Check health:
   - GET `/healthz` shows backend status and Ollama availability

Configure local model runner (Ollama/LM Studio) before querying with synthesis.
