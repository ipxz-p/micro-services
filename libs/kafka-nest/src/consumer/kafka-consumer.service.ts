import {
  Injectable,
  Inject,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, type Consumer } from 'kafkajs';
import { KAFKA_CLIENT_ID, KAFKA_GROUP_ID } from '../kafka.tokens';
import type { KafkaMessageContext, KafkaMessageHandler } from '../kafka.types';

@Injectable()
export class KafkaConsumerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka!: Kafka;
  private consumer!: Consumer;
  private readonly handlers = new Map<string, KafkaMessageHandler>();

  constructor(
    private readonly config: ConfigService,
    @Inject(KAFKA_CLIENT_ID) private readonly clientId: string,
    @Inject(KAFKA_GROUP_ID) private readonly groupId: string,
  ) {}

  register(topic: string, handler: KafkaMessageHandler): void {
    this.handlers.set(topic, handler);
  }

  async onApplicationBootstrap() {
    const topics = [...this.handlers.keys()];
    if (topics.length === 0) {
      this.logger.warn('No Kafka topic handlers registered');
      return;
    }

    const brokers = this.config
      .getOrThrow<string>('KAFKA_BROKERS')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);

    this.kafka = new Kafka({ clientId: this.clientId, brokers });
    this.consumer = this.kafka.consumer({
      groupId: this.groupId,
      allowAutoTopicCreation: true,
    });

    await this.consumer.connect();
    await this.consumer.subscribe({ topics, fromBeginning: false });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message }) => {
        const handler = this.handlers.get(topic);
        if (!handler) {
          return;
        }

        const headers = Object.fromEntries(
          Object.entries(message.headers ?? {}).map(([key, value]) => [
            key,
            value?.toString() ?? '',
          ]),
        );

        await handler({
          topic,
          partition,
          offset: message.offset,
          key: message.key?.toString() ?? null,
          headers,
          value: message.value?.toString() ?? '',
        });

        await this.consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (BigInt(message.offset) + 1n).toString(),
          },
        ]);
      },
    });

    this.logger.log(
      `Kafka consumer running (clientId=${this.clientId}, groupId=${this.groupId}, topics=${topics.join(', ')})`,
    );
  }

  async onModuleDestroy() {
    await this.consumer?.disconnect();
  }
}
