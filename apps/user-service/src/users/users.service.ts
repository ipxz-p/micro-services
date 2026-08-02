import {
  USER_TOPICS,
  type UserCreatedV1Event,
} from '@micro-service/event-contracts/user';
import { getCorrelationId } from '@micro-service/nest-grpc';
import type { CreateUserRequest } from '@micro-service/proto-contracts/user/v1/user';
import { BadRequestException, Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
    const correlationId = getCorrelationId();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email: data.email,
            password: data.passwordHash,
          },
          select: { id: true, email: true },
        });

        const event: UserCreatedV1Event = {
          eventId: crypto.randomUUID(),
          eventType: USER_TOPICS.CREATED_V1,
          occurredAt: new Date().toISOString(),
          userId: created.id,
          email: created.email,
          ...(correlationId ? { correlationId } : {}),
        };

        await tx.outboxMessage.create({
          data: {
            topic: USER_TOPICS.CREATED_V1,
            partitionKey: String(created.id),
            payload: event,
          },
        });

        return created;
      });
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
}
