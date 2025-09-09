# ProofSense Demo Script (<3 minutes)

## Opening (15 seconds)
"Hi! I'm demonstrating ProofSense - a local, offline-first contract analysis agent built with OpenAI's gpt-oss models. ProofSense helps lawyers and compliance teams analyze contracts with transparent source citations, and can be fine-tuned for specialized domains."

## Problem & Solution (30 seconds)
"Traditional contract analysis tools either send your sensitive data to the cloud, or give you answers without showing their sources. ProofSense solves both problems:
- Runs completely offline using gpt-oss models
- Provides transparent citations for every claim
- Can be fine-tuned on your specific contract types"

## Live Demo (90 seconds)

### 1. Ingest Contracts (20 seconds)
- Open web UI at localhost:3000
- Show backend status: "Backend is running, Ollama available with gpt-oss model"
- Paste Contract A text into ingest box
- Click "Ingest" - show successful ingestion
- Repeat quickly for Contracts B and C

### 2. Query Without Fine-tuning (25 seconds)
- Query: "What are the liability caps across all contracts?"
- Uncheck "Use FT" 
- Click "Ask"
- Show answer with citations
- Point out: "Notice it found the liability cap in Contract B and cited the source"

### 3. Start Fine-tuning (20 seconds)
- Click "Start FT Job"
- Show job status: pending → running → completed
- Point out metrics: "Loss decreased to 0.15, accuracy improved to 92%"

### 4. Query With Fine-tuning (25 seconds)
- Same query: "What are the liability caps across all contracts?"
- Check "Use FT" this time
- Click "Ask"
- Show improved answer (more detailed, better structured)
- Compare before/after results

## Key Benefits (30 seconds)
"ProofSense demonstrates three key advantages:
1. **Offline-first**: Your sensitive contracts never leave your machine
2. **Transparent**: Every answer includes source citations with exact quotes
3. **Improvable**: Fine-tuning on your contract types improves accuracy and domain-specific understanding

This makes it perfect for law firms, compliance teams, and anyone who needs trustworthy contract analysis without compromising data privacy."

## Closing (15 seconds)
"ProofSense showcases the power of open-weight reasoning models like gpt-oss for specialized, privacy-critical applications. The code is open source and ready to run locally. Thank you!"

---

## Technical Notes for Demo:
- Have contracts pre-loaded in clipboard for quick pasting
- Practice transitions to stay under 3 minutes
- Emphasize offline/privacy and citations throughout
- Show actual model responses, don't fake them
- Have backup queries ready in case of issues

## Sample Queries for Demo:
1. "What are the liability caps across all contracts?"
2. "How can these agreements be terminated?"
3. "What are the confidentiality requirements?"
4. "What security controls are mentioned?"
