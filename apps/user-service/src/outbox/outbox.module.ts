import { Module } from '@nestjs/common';
import { KafkaProducerModule } from '@micro-service/kafka-nest';
import { OUTBOX_STORE, OutboxModule } from '@micro-service/nest-outbox';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaOutboxStore } from './prisma-outbox.store';

@Module({
  imports: [
    OutboxModule.forService({
      imports: [
        PrismaModule,
        KafkaProducerModule.forRoot({ clientId: 'user-service' }),
      ],
      store: { provide: OUTBOX_STORE, useClass: PrismaOutboxStore },
    }),
  ],
})
export class UserOutboxModule {}
