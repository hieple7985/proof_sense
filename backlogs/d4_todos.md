# Day 4 — Backlog (ProofSense)

## Goals (end of Day 4)
- Basic answer synthesis via Ollama (if available) using prompt template — DONE (with fallback)
- Return citations stub (map top‑K contexts to citation objects) — DONE
- Improve retrieval quality (cosine second-pass, de‑dup by doc name) — DONE
- Web shows answer + citations list (ids/names) — DONE
- Seed sample contracts and QA set, update README — DONE

## Tasks
- Backend
  - Add `AnswerService` using `generateOllama({ model:'gpt-oss-20b', prompt })` — DONE
  - `QueryController`: optional `synthesize=true` → call AnswerService with top‑K contexts — DONE
  - Map contexts → citations stub: `{ docId, quote?, offsets? }` (placeholder) — DONE
  - Simple rerank: average scores for chunks with same `name`, keep best — DONE
- Packages
  - `@proofsense/prompts`: add base template for contract Q&A with citations — DONE
- Web
  - Show `answer` string above contexts; toggle “Synthesize” checkbox in UI — DONE
  - List citations under answer (from stub) — DONE
- Data & Docs
  - Add `samples/contracts/*.md` (2–3 files) — DONE
  - Add `samples/qa.json` (5–10 Q/A items) — DONE
  - Update root and app READMEs with Day 4 instructions — DONE

## Milestones
- M1: `/query` with `{ synthesize:true }` returns an `answer` string — DONE
- M2: Response includes `citations` array (stub) — DONE
- M3: UI renders answer + citations — DONE

## Nice-to-have
- PDF text extraction for text-based PDFs
- Health shows model tags (first tag name) when Ollama available

## Notes
- If Ollama is unavailable, keep synthesis disabled; retrieval-only still works.

---
Day 4 status: All core goals achieved. Ready for Day 5 improvements.
