import {
  USER_CREATED_V1_TOPIC,
  type UserCreatedV1Event,
} from '@micro-service/event-contracts';
import type { CreateUserRequest } from '@micro-service/proto-contracts';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { getCorrelationId } from '../common/grpc-request-context';
import { KafkaProducerService } from '@micro-service/kafka-nest';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return { found: false };
    }

    return { found: true, id: user.id, email: user.email };
  }

  async createWithHashedPassword(
    data: Pick<CreateUserRequest, 'email' | 'passwordHash'>,
  ) {
    try {
      const created = await this.prisma.user.create({
        data: {
          email: data.email,
          password: data.passwordHash,
        },
        select: {
          id: true,
          email: true,
        },
      });

      await this.publishUserCreatedEvent(created);

      return created;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('User already exists');
      }
      throw error;
    }
  }

  async verifyCredentials(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return { valid: false };
    }

    const valid = await compare(data.password, user.password);
    if (!valid) {
      return { valid: false };
    }

    return { valid: true, id: user.id, email: user.email };
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });
  }

  private async publishUserCreatedEvent(user: {
    id: number;
    email: string;
  }): Promise<void> {
    const correlationId = getCorrelationId();
    const event: UserCreatedV1Event = {
      eventId: crypto.randomUUID(),
      eventType: USER_CREATED_V1_TOPIC,
      occurredAt: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      ...(correlationId ? { correlationId } : {}),
    };

    try {
      await this.kafkaProducer.publish(
        USER_CREATED_V1_TOPIC,
        String(user.id),
        event,
      );
      this.logger.log(
        `Published ${event.eventType} for userId=${user.id} eventId=${event.eventId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish ${event.eventType} for userId=${user.id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
