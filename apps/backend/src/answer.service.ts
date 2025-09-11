import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
let modelRunner: any;
try {
  modelRunner = require('@proofsense/model-runner');
} catch {
  modelRunner = require('../../../packages/model-runner/src/index.js');
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
let buildAnswerPrompt: any;
try {
  // Prefer workspace package resolution
  ({ buildAnswerPrompt } = require('@proofsense/prompts'));
} catch {
  // Fallback to relative path during local/dev or certain CI linkers
  ({ buildAnswerPrompt } = require('../../../packages/prompts/src'));
}
import { config } from './config';
import { FineTuneService } from './finetune.service';

// Use small model for local dev, gpt-oss:20b for demo/production
const DEFAULT_LOCAL_MODEL = process.env.OLLAMA_MODEL || process.env.MODEL_NAME ||
  (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE === 'true' ? 'gpt-oss:20b' : 'llama3.2:1b');

@Injectable()
export class AnswerService {
  constructor(private readonly ft: FineTuneService) {}

  async synthesize(params: { query: string; contexts: { id: string; name: string; score: number }[]; useFT?: boolean }) {
    const prompt = buildAnswerPrompt(params.query, params.contexts);

    let model = DEFAULT_LOCAL_MODEL;
    if (params.useFT) {
      const jobs = this.ft.listJobs();
      const completedFT = jobs.find(j => j.status === 'completed' && j.model.includes('gpt-oss-20b'));
      if (completedFT) {
        model = `gpt-oss-20b-lora-${completedFT.id}`;
      }
    }

    const res = await modelRunner.generateOllama({ host: config.ollamaHost, model, prompt }).catch(() => null);
    if (!res || !res.ok) return 'Insufficient evidence or local model unavailable.';
    const data = res.data || {};
    return data.response || String(data) || '';
  }
}
