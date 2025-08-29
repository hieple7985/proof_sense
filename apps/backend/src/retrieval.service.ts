import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { chunkText, embedText, cosineSim } = require('@proofsense/retrieval');

type VecItem = { id: string; name: string; text: string; vec: number[] };

@Injectable()
export class RetrievalService {
  private datasets = new Map<string, VecItem[]>();

  upsert(datasetId: string, id: string, name: string, text: string) {
    const chunks = chunkText(text);
    const arr = this.datasets.get(datasetId) || [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkId = `${id}::${i}`;
      arr.push({ id: chunkId, name, text: chunks[i], vec: embedText(chunks[i]) });
    }
    this.datasets.set(datasetId, arr);
  }

  search(datasetId: string, query: string, k = 3) {
    const items = this.datasets.get(datasetId) || [];
    if (!items.length) return [] as { id: string; name: string; score: number }[];
    const qv = embedText(query);
    return items
      .map((it: VecItem) => ({ id: it.id, name: it.name, score: cosineSim(qv, it.vec) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}
