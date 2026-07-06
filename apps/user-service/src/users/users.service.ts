import type { CreateUserRequest } from '@micro-service/proto-contracts';
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
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          password: data.passwordHash,
        },
        select: {
          id: true,
          email: true,
        },
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
