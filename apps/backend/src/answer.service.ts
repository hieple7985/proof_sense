import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const modelRunner = require('@proofsense/model-runner');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { buildAnswerPrompt } = require('@proofsense/prompts');
import { config } from './config';

@Injectable()
export class AnswerService {
  async synthesize(params: { query: string; contexts: { id: string; name: string; score: number }[] }) {
    const prompt = buildAnswerPrompt(params.query, params.contexts);
    const res = await modelRunner.generateOllama({ host: config.ollamaHost, model: 'gpt-oss-20b', prompt }).catch(() => null);
    if (!res || !res.ok) return 'Insufficient evidence or local model unavailable.';
    const data = res.data || {};
    return data.response || String(data) || '';
  }
}
