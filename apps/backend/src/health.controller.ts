import { Controller, Get } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
let modelRunner: any;
try {
  modelRunner = require('@proofsense/model-runner');
} catch {
  modelRunner = require('../../../packages/model-runner/src/index.js');
}
import { config } from './config';

@Controller()
export class HealthController {
  @Get('healthz')
  async getHealth() {
    const ping = await modelRunner.pingOllama(config.ollamaHost);
    const tag = ping && ping.ok && ping.data && Array.isArray(ping.data.models) && ping.data.models.length ? ping.data.models[0].name : undefined;
    return { status: 'ok', ollama: !!ping.ok, tag };
  }
}
