import { Body, Controller, Post } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';
import { AnswerService } from './answer.service';

@Controller('query')
export class QueryController {
  constructor(private readonly retrieval: RetrievalService, private readonly answer: AnswerService) {}

  @Post()
  async query(@Body() body: { datasetId?: string; query: string; k?: number; synthesize?: boolean }) {
    const datasetId = body.datasetId || 'default';
    const k = body.k || 3;
    const contexts = this.retrieval.search(datasetId, body.query, k);
    let answer: string | undefined = undefined;
    if (body.synthesize) {
      answer = await this.answer.synthesize({ query: body.query, contexts });
    }
    const citations = contexts.map((c, idx) => ({ docId: c.id.split('::')[0], page: undefined, quote: undefined, offsets: undefined, rank: idx + 1 }));
    return { answer, contexts, citations };
  }
}
