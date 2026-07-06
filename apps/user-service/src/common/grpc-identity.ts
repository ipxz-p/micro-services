import { status } from '@grpc/grpc-js';
import type { Metadata } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const GRPC_METADATA_USER_ID = 'x-user-id';
export const GRPC_METADATA_USER_EMAIL = 'x-user-email';
export const GRPC_METADATA_CORRELATION_ID = 'x-correlation-id';

export type GrpcIdentity = {
  userId: string;
  userEmail?: string;
  correlationId?: string;
};

export function parseIdentity(metadata?: Metadata): GrpcIdentity | null {
  const userId = metadata?.get(GRPC_METADATA_USER_ID)?.[0];

  if (!userId || typeof userId !== 'string') {
    return null;
  }

  const userEmail = metadata?.get(GRPC_METADATA_USER_EMAIL)?.[0];
  const correlationId = metadata?.get(GRPC_METADATA_CORRELATION_ID)?.[0];

  return {
    userId,
    userEmail: typeof userEmail === 'string' ? userEmail : undefined,
    correlationId:
      typeof correlationId === 'string' ? correlationId : undefined,
  };
}

export function requireIdentity(metadata?: Metadata): GrpcIdentity {
  const identity = parseIdentity(metadata);

  if (!identity) {
    throw new RpcException({
      code: status.UNAUTHENTICATED,
      message: 'Missing identity context',
    });
  }

  return identity;
}
