# quickstart

## install
```bash
pnpm install
ollama pull gpt-oss:20b  # or llama3.2:1b for testing
```

## run
```bash
# terminal 1
pnpm --filter @proofsense/backend dev

# terminal 2  
pnpm --filter @proofsense/web dev
```

## use
1. open http://localhost:3000
2. paste contract text → ingest
3. ask questions → get cited answers
4. start finetune job → improved results

## demo queries
- "what are the payment terms?"
- "how can this agreement be terminated?"
- "what are the liability caps?"
- "what confidentiality requirements exist?"
