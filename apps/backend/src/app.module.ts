import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { IngestController } from './ingest.controller';
import { QueryController } from './query.controller';
import { RetrievalService } from './retrieval.service';
import { AnswerService } from './answer.service';
import { FineTuneService } from './finetune.service';
import { FineTuneController } from './finetune.controller';

@Module({
  controllers: [HealthController, IngestController, QueryController, FineTuneController],
  providers: [RetrievalService, AnswerService, FineTuneService],
})
export class AppModule {}
