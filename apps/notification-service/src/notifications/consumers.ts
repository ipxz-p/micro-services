import {
  USER_CREATED_V1_TOPIC,
  type UserCreatedV1Event,
} from '@micro-service/event-contracts';
import { KafkaConsumerService } from '@micro-service/kafka-nest';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class NotificationConsumers implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumers.name);

  constructor(private readonly kafkaConsumer: KafkaConsumerService) {}

  onModuleInit() {
    this.kafkaConsumer.register(
      USER_CREATED_V1_TOPIC,
      async (message) => this.handleUserCreated(message.value),
    );
  }

  private async handleUserCreated(rawValue: string): Promise<void> {
    const event = JSON.parse(rawValue) as UserCreatedV1Event;
    this.logger.log(
      `Send welcome email to ${event.email} (userId=${event.userId}, eventId=${event.eventId})`,
    );
  }
}
