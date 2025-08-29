import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { IngestController } from './ingest.controller';
import { QueryController } from './query.controller';
import { RetrievalService } from './retrieval.service';
import { AnswerService } from './answer.service';

@Module({
  controllers: [HealthController, IngestController, QueryController],
  providers: [RetrievalService, AnswerService],
})
export class AppModule {}
