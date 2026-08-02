import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProcessedEventsService } from './processed-events.service';

@Module({
  imports: [PrismaModule],
  providers: [ProcessedEventsService],
  exports: [ProcessedEventsService],
})
export class ProcessedEventsModule {}
