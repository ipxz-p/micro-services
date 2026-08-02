import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildKafkaMessageHeaders } from '@micro-service/event-contracts';
import { Kafka, Partitioners, type Producer } from 'kafkajs';
import { KAFKA_CLIENT_ID } from '../kafka.tokens';
import type { PublishableEvent } from '../kafka.types';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka!: Kafka;
  private producer!: Producer;

  constructor(
    private readonly config: ConfigService,
    @Inject(KAFKA_CLIENT_ID) private readonly clientId: string,
  ) {}

  async onModuleInit() {
    const brokers = this.config
      .getOrThrow<string>('KAFKA_BROKERS')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);

    this.kafka = new Kafka({ clientId: this.clientId, brokers });
    this.producer = this.kafka.producer({
      idempotent: true,
      maxInFlightRequests: 1,
      createPartitioner: Partitioners.DefaultPartitioner,
    });

    await this.producer.connect();
    this.logger.log(
      `Kafka producer connected (clientId=${this.clientId}, brokers=${brokers.join(', ')})`,
    );
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
  }

  async publish(
    topic: string,
    partitionKey: string,
    event: PublishableEvent,
  ): Promise<void> {
    await this.producer.send({
      topic,
      acks: -1,
      messages: [
        {
          key: partitionKey,
          value: JSON.stringify(event),
          headers: buildKafkaMessageHeaders(event),
        },
      ],
    });
  }
}
