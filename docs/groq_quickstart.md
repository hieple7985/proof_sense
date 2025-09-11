# Run ProofSense with Groq (gpt-oss:20b) via Ollama-compatible proxy

This guide lets you run the app with the real gpt-oss:20b model from Groq without changing app code. The backend continues to talk to an Ollama host, which is provided by a tiny proxy that forwards to Groq's OpenAI-compatible API.

## Prereqs
- Node 18+
- Groq API key: export GROQ_API_KEY=... (get it from Groq dashboard)

## Start the proxy
```
# from repo root
export GROQ_API_KEY=YOUR_KEY
node 3_dev/proof_sense/scripts/groq_ollama_proxy.mjs
```
The proxy listens on 127.0.0.1:11434 and exposes:
- GET /api/tags -> returns gpt-oss:20b
- POST /api/generate -> forwards to Groq model "openai/gpt-oss-20b"

## Start the app (no code changes)
```
cd 3_dev/proof_sense
pnpm install
pnpm --filter @proofsense/backend build
pnpm --filter @proofsense/web build

# point backend to the proxy and enforce model
export OLLAMA_HOST=http://127.0.0.1:11434
export MODEL_NAME=gpt-oss:20b

node apps/backend/dist/main.js &
NEXT_PUBLIC_API_BASE=http://127.0.0.1:3001 pnpm --filter @proofsense/web start -p 3000
```

## Verify
```
curl -s http://127.0.0.1:3001/healthz
# expect: {"status":"ok","ollama":true,"tag":"gpt-oss:20b"}
```
Ask a question in the UI. The request is served by Groq using the real "openai/gpt-oss-20b" model.

## Notes
- Keep prompts concise for latency.
- You can deploy the proxy + backend + web on any small VM; no GPU required.
- For pure local (no external API), use Ollama with `ollama pull gpt-oss:20b` instead.

