import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002';

/**
 * กัน handler ทำงานซ้ำเมื่อ Kafka redeliver message เดิม
 */
@Injectable()
export class ProcessedEventsService {
  private readonly logger = new Logger(ProcessedEventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * true = event นี้เพิ่งถูกบันทึกเป็นครั้งแรก (ควรประมวลผลต่อ)
   * false = เคยประมวลผลไปแล้ว (ข้าม ไม่ต้องทำซ้ำ)
   */
  async tryMarkProcessed(eventId: string, eventType: string): Promise<boolean> {
    try {
      await this.prisma.processedEvent.create({
        data: { eventId, eventType },
      });
      return true;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR
      ) {
        this.logger.warn(
          `Skip duplicate event eventId=${eventId} eventType=${eventType} (redelivered)`,
        );
        return false;
      }
      throw error;
    }
  }
}
