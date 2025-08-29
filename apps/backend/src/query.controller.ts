import { Body, Controller, Post } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';

@Controller('query')
export class QueryController {
  constructor(private readonly retrieval: RetrievalService) {}

  @Post()
  async query(@Body() body: { datasetId?: string; query: string; k?: number }) {
    const datasetId = body.datasetId || 'default';
    const k = body.k || 3;
    const contexts = this.retrieval.search(datasetId, body.query, k);
    return {
      answer: `stub answer for: ${body.query}`,
      contexts,
      citations: []
    };
  }
}
