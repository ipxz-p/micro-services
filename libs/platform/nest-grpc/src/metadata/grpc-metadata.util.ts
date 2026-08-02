import { Metadata } from '@grpc/grpc-js';
import {
  GRPC_METADATA_CORRELATION_ID,
  GRPC_METADATA_USER_EMAIL,
  GRPC_METADATA_USER_ID,
  type ServiceIdentity,
} from '@micro-service/service-identity';

/** ฝั่งขาออก: ประกอบ metadata จาก identity + correlationId */
export function buildGrpcMetadata(
  identity?: ServiceIdentity | null,
  correlationId?: string,
): Metadata {
  const metadata = new Metadata();

  if (identity) {
    metadata.set(GRPC_METADATA_USER_ID, identity.userId);
    if (identity.userEmail) {
      metadata.set(GRPC_METADATA_USER_EMAIL, identity.userEmail);
    }
  }

  if (correlationId) {
    metadata.set(GRPC_METADATA_CORRELATION_ID, correlationId);
  }

  return metadata;
}

/** ฝั่งขาเข้า: แกะ identity ออกจาก metadata (null = ไม่มี identity) */
export function parseIdentity(metadata?: Metadata): ServiceIdentity | null {
  const userId = metadata?.get(GRPC_METADATA_USER_ID)?.[0];

  if (!userId || typeof userId !== 'string') {
    return null;
  }

  const userEmail = metadata?.get(GRPC_METADATA_USER_EMAIL)?.[0];

  return {
    userId,
    userEmail: typeof userEmail === 'string' ? userEmail : undefined,
  };
}

export function parseCorrelationId(metadata?: Metadata): string | undefined {
  const value = metadata?.get(GRPC_METADATA_CORRELATION_ID)?.[0];
  return typeof value === 'string' ? value : undefined;
}
