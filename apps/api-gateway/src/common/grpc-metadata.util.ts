import { Metadata } from '@grpc/grpc-js';
import type { AccessTokenPayload } from '../auth/types/access-token-payload';

export const GRPC_METADATA_USER_ID = 'x-user-id';
export const GRPC_METADATA_USER_EMAIL = 'x-user-email';
export const GRPC_METADATA_CORRELATION_ID = 'x-correlation-id';

export function buildGrpcMetadata(
  user?: AccessTokenPayload,
  correlationId?: string,
): Metadata {
  const metadata = new Metadata();

  if (user) {
    metadata.set(GRPC_METADATA_USER_ID, String(user.sub));
    metadata.set(GRPC_METADATA_USER_EMAIL, user.email);
  }

  if (correlationId) {
    metadata.set(GRPC_METADATA_CORRELATION_ID, correlationId);
  }

  return metadata;
}
