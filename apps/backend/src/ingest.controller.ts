import { Body, Controller, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { store } from './data.store';

@Controller('ingest')
export class IngestController {
  @Post()
  async ingest(@Body() body: { datasetId?: string; name?: string; text?: string }) {
    const datasetId = body.datasetId || 'default';
    const name = body.name || `doc-${Date.now()}`;
    const text = body.text || '';
    const id = randomUUID();
    store.addDoc(datasetId, { id, name, text });
    return { datasetId, id, name, length: text.length };
  }
}
