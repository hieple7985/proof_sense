import { Controller, Get } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const modelRunner = require('@proofsense/model-runner');
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
