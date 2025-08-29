# Day 5 — Backlog (ProofSense)

## Goals (end of Day 5)
- Improve retrieval quality: de-dup by doc, second-pass rerank, top-K tuning — DONE
- UX polish: loading states, error messages, better formatting — DONE
- Prepare mini domain dataset for FT: 20–50 Q/A with citations — PARTIAL (5 QA items; expand later)
- Add samples/contracts and basic README updates — DONE

## Tasks
- Backend
  - Implement de-dup by `name` aggregation; keep best-scoring chunk per doc — DONE
  - Add second-pass rerank (combine initial score with simple BM25/length prior) — DONE
  - Add `/healthz` detail: if Ollama, return first tag name — DONE
- Packages
  - Extract prompt template to `@proofsense/prompts`; add citation-aware template — DONE
- Web
  - Show loading state for ingest/query; display errors — DONE
  - Format answer with basic markdown styling — DONE
- Data
  - Add `samples/contracts/contractA.md`, `contractB.md`, `contractC.md` — DONE
  - Add `samples/qa.json` with 20–50 items (domain-specific) — PARTIAL (5 items; expand later)
- Docs
  - Update READMEs with steps for Day 5, samples usage — DONE

## Milestones
- M1: `/query` returns de-duplicated contexts with improved ranking — DONE
- M2: UI shows loading states and handles errors — DONE
- M3: Dataset files present and referenced in README — DONE

## Nice-to-have
- Add simple PDF text extraction (text-based) via `pdf-parse` or similar
- Basic rate-limit to protect backend locally

---
Day 5 status: Core goals achieved. Ready for Day 6 (Fine-tune preparation).
