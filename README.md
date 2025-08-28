# ProofSense Monorepo

- Apps:
  - `apps/backend` — NestJS API (ingest, retrieval, generation, citations, finetune)
  - `apps/web` — Next.js minimal UI
- Packages:
  - `packages/model-runner` — adapters for Ollama/LM Studio/remote GPU
  - `packages/retrieval` — chunking, embeddings, FAISS index
  - `packages/prompts` — prompt templates and chains
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

Configure local model runner (Ollama/LM Studio) before querying.
