import { Module } from '@nestjs/common';
import { KafkaConsumerModule } from '@micro-service/kafka-nest';
import { NotificationConsumers } from './consumers';

@Module({
  imports: [
    KafkaConsumerModule.forRoot({
      clientId: 'notification-service',
      groupId: 'notification-service',
    }),
  ],
  providers: [NotificationConsumers],
})
export class NotificationsModule {}
