import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const modelRunner = require('@proofsense/model-runner');
import { config } from './config';

export type FTJob = {
  id: string;
  datasetId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  model: string;
  recipe: 'lora' | 'qlora';
  metrics?: { loss?: number; accuracy?: number };
  createdAt: Date;
  completedAt?: Date;
};

@Injectable()
export class FineTuneService {
  private jobs = new Map<string, FTJob>();

  async startJob(params: { datasetId: string; model?: string; recipe?: 'lora' | 'qlora' }): Promise<string> {
    const jobId = `ft_${Date.now()}`;
    const job: FTJob = {
      id: jobId,
      datasetId: params.datasetId,
      status: 'pending',
      model: params.model || 'gpt-oss-20b',
      recipe: params.recipe || 'lora',
      createdAt: new Date()
    };
    this.jobs.set(jobId, job);
    
    // Simulate job start (in real impl, this would call FT pipeline)
    setTimeout(() => {
      const currentJob = this.jobs.get(jobId);
      if (currentJob) {
        currentJob.status = 'running';
        setTimeout(() => {
          const finalJob = this.jobs.get(jobId);
          if (finalJob) {
            finalJob.status = 'completed';
            finalJob.completedAt = new Date();
            finalJob.metrics = { loss: 0.15, accuracy: 0.92 };
          }
        }, 5000); // Simulate 5s training
      }
    }, 1000);
    
    return jobId;
  }

  getJob(jobId: string): FTJob | null {
    return this.jobs.get(jobId) || null;
  }

  listJobs(): FTJob[] {
    return Array.from(this.jobs.values());
  }
}
