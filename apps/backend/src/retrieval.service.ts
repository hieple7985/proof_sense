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
    if (!items.length) return [] as { id: string; name: string; score: number; text: string }[];
    const qv = embedText(query);
    // score all chunks
    const scored = items.map((it: VecItem) => ({ id: it.id, name: it.name, score: cosineSim(qv, it.vec) }));
    // aggregate by doc name (de-dup)
    const byName = new Map<string, { name: string; best: { id: string; score: number }; avg: number; count: number }>();
    for (const s of scored) {
      const current = byName.get(s.name) || { name: s.name, best: { id: s.id, score: s.score }, avg: 0, count: 0 };
      if (s.score > current.best.score) current.best = { id: s.id, score: s.score };
      current.avg = (current.avg * current.count + s.score) / (current.count + 1);
      current.count += 1;
      byName.set(s.name, current);
    }
    // simple rerank: combine best and avg, include text content
    const reranked = Array.from(byName.values())
      .map(x => {
        const bestItem = items.find(it => it.id === x.best.id);
        return {
          id: x.best.id,
          name: x.name,
          score: 0.7 * x.best.score + 0.3 * x.avg,
          text: bestItem?.text || ''
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
    return reranked;
  }
}
