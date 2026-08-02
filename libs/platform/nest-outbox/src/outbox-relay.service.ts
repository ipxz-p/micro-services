import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { KafkaProducerService } from '@micro-service/kafka-nest';
import type { PublishableEvent } from '@micro-service/kafka-nest';
import { OUTBOX_STORE, type OutboxStore } from './outbox.types';

const POLL_INTERVAL_MS = 1000;
const BATCH_SIZE = 50;

@Injectable()
export class OutboxRelayService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(OutboxRelayService.name);
  private timer?: NodeJS.Timeout;
  private running = false;
  private stopped = false;

  constructor(
    @Inject(OUTBOX_STORE) private readonly store: OutboxStore,
    private readonly producer: KafkaProducerService,
  ) {}

  onApplicationBootstrap() {
    this.timer = setInterval(() => void this.drain(), POLL_INTERVAL_MS);
  }

  onModuleDestroy() {
    this.stopped = true;
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async drain(): Promise<number> {
    if (this.running || this.stopped) {
      return 0;
    }
    this.running = true;

    try {
      const records = await this.store.claimUnpublished(BATCH_SIZE);
      let published = 0;

      for (const record of records) {
        try {
          await this.producer.publish(
            record.topic,
            record.partitionKey,
            record.payload as PublishableEvent,
          );
          await this.store.markPublished(record.id);
          published++;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          await this.store.markFailed(record.id, message);
          this.logger.warn(
            `Failed to relay outbox ${record.id} (${record.topic}): ${message}`,
          );
        }
      }

      if (published > 0) {
        this.logger.log(`Relayed ${published} outbox message(s)`);
      }
      return published;
    } catch (error) {
      this.logger.error(
        `Outbox drain failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    } finally {
      this.running = false;
    }
  }
}
