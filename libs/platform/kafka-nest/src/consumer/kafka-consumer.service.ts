import {
  Injectable,
  Inject,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getEventSchema,
  KAFKA_HEADER_ATTEMPT_COUNT,
  KAFKA_HEADER_ERROR,
  KAFKA_HEADER_ORIGINAL_TOPIC,
} from '@micro-service/event-contracts';
import { Kafka, Partitioners, type Consumer, type Producer } from 'kafkajs';
import {
  KAFKA_CLIENT_ID,
  KAFKA_CONSUMER_OPTIONS,
  KAFKA_GROUP_ID,
} from '../kafka.tokens';
import type {
  KafkaConsumerModuleOptions,
  KafkaMessageHandler,
} from '../kafka.types';

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_BACKOFF_MS = 200;

@Injectable()
export class KafkaConsumerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka!: Kafka;
  private consumer!: Consumer;
  /** producer แยกไว้ส่ง DLQ โดยเฉพาะ */
  private dlqProducer!: Producer;
  private readonly handlers = new Map<string, KafkaMessageHandler>();

  constructor(
    private readonly config: ConfigService,
    @Inject(KAFKA_CLIENT_ID) private readonly clientId: string,
    @Inject(KAFKA_GROUP_ID) private readonly groupId: string,
    @Inject(KAFKA_CONSUMER_OPTIONS)
    private readonly options: KafkaConsumerModuleOptions,
  ) {}

  register<TEvent>(topic: string, handler: KafkaMessageHandler<TEvent>): void {
    this.handlers.set(topic, handler as KafkaMessageHandler);
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
    this.dlqProducer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });

    await this.dlqProducer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe({ topics, fromBeginning: false });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message }) => {
        const handler = this.handlers.get(topic);
        const rawValue = message.value?.toString() ?? '';
        const headers = Object.fromEntries(
          Object.entries(message.headers ?? {}).map(([key, value]) => [
            key,
            value?.toString() ?? '',
          ]),
        );
        const context = {
          topic,
          partition,
          offset: message.offset,
          key: message.key?.toString() ?? null,
          headers,
        };

        if (handler) {
          await this.processMessage(handler, rawValue, context);
        }

        // commit เสมอหลังจบ ไม่ว่าจะสำเร็จ หรือถูกโยนเข้า DLQ แล้ว
        // ถ้าไม่ commit partition จะค้างและ redeliver ตัวเดิมวนไม่จบ (poison pill)
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

  private async processMessage(
    handler: KafkaMessageHandler,
    rawValue: string,
    context: {
      topic: string;
      partition: number;
      offset: string;
      key: string | null;
      headers: Record<string, string>;
    },
  ): Promise<void> {
    let event: unknown;
    try {
      event = JSON.parse(rawValue);
    } catch (error) {
      await this.sendToDlq(context, rawValue, error, 0);
      return;
    }

    const schema = getEventSchema(context.topic);
    if (schema) {
      const parsed = schema.safeParse(event);
      if (!parsed.success) {
        await this.sendToDlq(context, rawValue, parsed.error, 0);
        return;
      }
      event = parsed.data;
    }

    const maxAttempts = this.options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    const backoffMs = this.options.retryBackoffMs ?? DEFAULT_RETRY_BACKOFF_MS;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await handler(event, context);
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          await this.sendToDlq(context, rawValue, error, attempt);
          return;
        }
        this.logger.warn(
          `Handler failed for ${context.topic} (attempt ${attempt}/${maxAttempts}): ${describeError(error)}`,
        );
        await sleep(backoffMs * 2 ** (attempt - 1));
      }
    }
  }

  private async sendToDlq(
    context: { topic: string; key: string | null; headers: Record<string, string> },
    rawValue: string,
    error: unknown,
    attempts: number,
  ): Promise<void> {
    const dlqTopic = `${context.topic}.dlq`;
    this.logger.error(
      `Sending message to ${dlqTopic} after ${attempts} attempt(s): ${describeError(error)}`,
    );

    try {
      await this.dlqProducer.send({
        topic: dlqTopic,
        messages: [
          {
            key: context.key,
            value: rawValue,
            headers: {
              ...context.headers,
              [KAFKA_HEADER_ORIGINAL_TOPIC]: context.topic,
              [KAFKA_HEADER_ERROR]: describeError(error).slice(0, 1000),
              [KAFKA_HEADER_ATTEMPT_COUNT]: String(attempts),
            },
          },
        ],
      });
    } catch (dlqError) {
      this.logger.error(
        `Failed to publish to ${dlqTopic}: ${describeError(dlqError)}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.consumer?.disconnect();
    await this.dlqProducer?.disconnect();
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
