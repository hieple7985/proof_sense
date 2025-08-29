import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { IngestController } from './ingest.controller';
import { QueryController } from './query.controller';

@Module({
  controllers: [HealthController, IngestController, QueryController],
  providers: [],
})
export class AppModule {}
