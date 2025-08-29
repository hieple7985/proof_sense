import { Body, Controller, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RetrievalService } from './retrieval.service';

@Controller('ingest')
export class IngestController {
  constructor(private readonly retrieval: RetrievalService) {}

  @Post()
  async ingest(@Body() body: { datasetId?: string; name?: string; text?: string }) {
    const datasetId = body.datasetId || 'default';
    const name = body.name || `doc-${Date.now()}`;
    const text = body.text || '';
    const id = randomUUID();
    this.retrieval.upsert(datasetId, id, name, text);
    return { datasetId, id, name, length: text.length };
  }
}
