import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { IngestController } from './ingest.controller';
import { QueryController } from './query.controller';
import { RetrievalService } from './retrieval.service';

@Module({
  controllers: [HealthController, IngestController, QueryController],
  providers: [RetrievalService],
})
export class AppModule {}
