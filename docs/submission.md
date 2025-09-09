# submission materials

## devpost entry

**title**: proofsense - local contract analysis with gpt-oss

**category**: most useful fine-tune

**description**:
offline-first contract analysis agent built with gpt-oss models. provides transparent source citations and can be fine-tuned for specialized legal domains. keeps sensitive data local while delivering trustworthy ai analysis.

**what it does**:
- analyzes contracts completely offline using gpt-oss models
- provides transparent citations for every claim
- supports fine-tuning for domain-specific improvements
- handles multiple documents with cross-referencing
- maintains data privacy with local-only processing

**how we built it**:
- backend: nestjs api with ollama integration
- frontend: next.js with modern ui design
- retrieval: custom chunking + embeddings + vector search
- fine-tuning: lora adaptation pipeline for gpt-oss
- deployment: local-first with optional remote gpu

**challenges**:
- integrating gpt-oss models with local inference
- building reliable citation extraction
- designing privacy-first architecture
- creating convincing fine-tuning demo

**accomplishments**:
- fully functional offline contract analysis
- transparent source attribution system
- elegant user interface
- working fine-tuning pipeline
- production-ready codebase

**what we learned**:
- gpt-oss models excel at reasoning tasks
- local inference is viable for specialized domains
- citation systems build user trust
- fine-tuning provides measurable improvements

**what's next**:
- real fine-tuning on legal datasets
- advanced citation extraction
- multi-modal document support
- enterprise deployment options

## demo video script

see docs/demo.md for 3-minute demo flow

## repo highlights

- clean monorepo structure
- comprehensive documentation
- working sample data
- production-ready code
- elegant user interface
