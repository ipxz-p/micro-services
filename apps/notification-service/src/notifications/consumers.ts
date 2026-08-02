import {
  USER_TOPICS,
  type UserCreatedV1Event,
} from '@micro-service/event-contracts/user';
import { KafkaConsumerService } from '@micro-service/kafka-nest';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProcessedEventsService } from '../processed-events/processed-events.service';

@Injectable()
export class NotificationConsumers implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumers.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly processedEvents: ProcessedEventsService,
  ) {}

  onModuleInit() {
    this.kafkaConsumer.register<UserCreatedV1Event>(
      USER_TOPICS.CREATED_V1,
      async (event) => this.handleUserCreated(event),
    );
  }

  private async handleUserCreated(event: UserCreatedV1Event): Promise<void> {
    const isNew = await this.processedEvents.tryMarkProcessed(
      event.eventId,
      event.eventType,
    );

    if (!isNew) {
      return;
    }

    this.logger.log(
      `Send welcome email to ${event.email} (userId=${event.userId}, eventId=${event.eventId})`,
    );
  }
}
