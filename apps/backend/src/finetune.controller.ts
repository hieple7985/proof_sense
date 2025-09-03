import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FineTuneService, FTJob } from './finetune.service';

@Controller('finetune')
export class FineTuneController {
  constructor(private readonly ft: FineTuneService) {}

  @Post()
  async startJob(@Body() body: { datasetId: string; model?: string; recipe?: 'lora' | 'qlora' }) {
    const jobId = await this.ft.startJob(body);
    return { jobId, status: 'started' };
  }

  @Get('jobs/:jobId')
  async getJob(@Param('jobId') jobId: string): Promise<FTJob | { error: string }> {
    const job = this.ft.getJob(jobId);
    if (!job) return { error: 'Job not found' };
    return job;
  }

  @Get('jobs')
  async listJobs(): Promise<FTJob[]> {
    return this.ft.listJobs();
  }
}
