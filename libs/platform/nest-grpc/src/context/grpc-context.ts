import { Metadata } from '@grpc/grpc-js';
import { AsyncLocalStorage } from 'async_hooks';
import type { ServiceIdentity } from '@micro-service/service-identity';

export type GrpcRequestContext = {
  metadata?: Metadata;
  identity: ServiceIdentity | null;
  correlationId?: string;
};

const storage = new AsyncLocalStorage<GrpcRequestContext>();

export function runWithGrpcContext<T>(
  context: GrpcRequestContext,
  fn: () => T,
): T {
  return storage.run(context, fn);
}

export function getGrpcContext(): GrpcRequestContext | undefined {
  return storage.getStore();
}

export function getGrpcMetadata(): Metadata | undefined {
  return storage.getStore()?.metadata;
}

export function getIdentity(): ServiceIdentity | null | undefined {
  return storage.getStore()?.identity;
}

export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}

export function cloneGrpcMetadata(metadata: Metadata): Metadata {
  return metadata.clone();
}
