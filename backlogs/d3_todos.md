# Day 3 — Backlog (ProofSense)

## Goals (end of Day 3)
- Wire model runner (Ollama) ping + basic generate call
- Implement embeddings adapter + in-memory vector index; integrate into backend
- Query flow: retrieve top-K chunks → return contexts (ids/names/scores)
- Add `.env.example` and config loader (PORT, OLLAMA_HOST)
- Seed 2–3 sample contracts and 5–10 synthetic Q/A

## Tasks
- Backend
  - Config service: read `.env` (PORT=3001, OLLAMA_HOST=http://localhost:11434)
  - RetrievalService: call `@proofsense/retrieval` (chunk/import, embed, index)
  - QueryController: use RetrievalService to return top-K contexts
  - Health: extend to include Ollama ping status
- Packages
  - `@proofsense/model-runner`: implement `pingOllama()` and `generate()` (stub prompt)
  - `@proofsense/retrieval`: add embeddings adapter (CPU-friendly) and in-memory index API
- Web
  - Show contexts list (id, name, score) under Result
  - Add status indicator for backend health + Ollama ping
- Data
  - Add `samples/contracts/*.md`
  - Add `samples/qa.json` with 5–10 items
- Dev Quality
  - `.env.example` at repo root and backend app folder
  - Update READMEs with Day 3 run instructions

## Milestones
- M1: `/healthz` returns `{status:'ok', ollama:true|false}`
- M2: `/ingest` indexes text into vector store
- M3: `/query` returns top-K contexts from index

## Nice-to-have
- Simple rerank by cosineSim second-pass
- Basic answer synthesis with citations (still stub)

## Notes
- Keep everything offline; Ollama optional. If unavailable, retrieval still works.
