import { Controller, Get } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const modelRunner = require('@proofsense/model-runner');
import { config } from './config';

@Controller()
export class HealthController {
  @Get('healthz')
  async getHealth() {
    const ping = await modelRunner.pingOllama(config.ollamaHost);
    return { status: 'ok', ollama: !!ping.ok };
  }
}
