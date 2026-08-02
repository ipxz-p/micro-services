import { Module } from '@nestjs/common';
import { KafkaConsumerModule } from '@micro-service/kafka-nest';
import { ProcessedEventsModule } from '../processed-events/processed-events.module';
import { NotificationConsumers } from './consumers';

@Module({
  imports: [
    KafkaConsumerModule.forRoot({
      clientId: 'notification-service',
      groupId: 'notification-service',
      maxAttempts: 3,
      retryBackoffMs: 200,
    }),
    ProcessedEventsModule,
  ],
  providers: [NotificationConsumers],
})
export class NotificationsModule {}
