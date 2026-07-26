import { AsyncLocalStorage } from 'async_hooks';

export type GrpcRequestContext = {
  correlationId?: string;
};

const grpcRequestContextStorage = new AsyncLocalStorage<GrpcRequestContext>();

export function runWithGrpcRequestContext<T>(
  context: GrpcRequestContext,
  fn: () => T,
): T {
  return grpcRequestContextStorage.run(context, fn);
}

export function getGrpcRequestContext(): GrpcRequestContext | undefined {
  return grpcRequestContextStorage.getStore();
}

export function getCorrelationId(): string | undefined {
  return grpcRequestContextStorage.getStore()?.correlationId;
}
