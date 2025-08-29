import { Body, Controller, Post } from '@nestjs/common';
import { store } from './data.store';

@Controller('query')
export class QueryController {
  @Post()
  async query(@Body() body: { datasetId?: string; query: string; k?: number }) {
    const datasetId = body.datasetId || 'default';
    const k = body.k || 3;
    const ds = store.getDataset(datasetId);
    if (!ds) return { answer: '', contexts: [], citations: [] };
    const ranked = [...ds.docs]
      .map(d => ({ d, score: Math.min(d.text.length, body.query.length) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
    return {
      answer: `stub answer for: ${body.query}`,
      contexts: ranked.map(r => ({ id: r.d.id, name: r.d.name, score: r.score })),
      citations: []
    };
  }
}
