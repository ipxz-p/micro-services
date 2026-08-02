import { Injectable } from '@nestjs/common';
import type { OutboxRecord, OutboxStore } from '@micro-service/nest-outbox';
import { PrismaService } from '../prisma/prisma.service';

type OutboxRow = {
  id: string;
  topic: string;
  partitionKey: string;
  payload: unknown;
};

@Injectable()
export class PrismaOutboxStore implements OutboxStore {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * FOR UPDATE SKIP LOCKED = ถ้ามี relay หลาย instance (หรือหลาย replica ของ
   * user-service) แต่ละตัวจะหยิบคนละแถว ไม่แย่งกันและไม่ต้องรอกัน
   * ถ้าใช้ findMany ธรรมดา ทุก instance จะหยิบแถวเดียวกันแล้วส่ง event ซ้ำ
   */
  async claimUnpublished(limit: number): Promise<OutboxRecord[]> {
    const rows = await this.prisma.$queryRaw<OutboxRow[]>`
      SELECT id, topic, "partitionKey", payload
      FROM "OutboxMessage"
      WHERE "publishedAt" IS NULL
      ORDER BY "createdAt" ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    `;

    return rows.map((row) => ({
      id: row.id,
      topic: row.topic,
      partitionKey: row.partitionKey,
      payload: row.payload,
    }));
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: { id },
      data: { publishedAt: new Date() },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        lastError: error.slice(0, 1000),
      },
    });
  }
}
