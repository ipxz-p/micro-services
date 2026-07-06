import { AsyncLocalStorage } from 'async_hooks';
import type { GrpcIdentity } from './grpc-identity';

const grpcIdentityStorage = new AsyncLocalStorage<GrpcIdentity | null>();

export function runWithGrpcIdentity<T>(
  identity: GrpcIdentity | null,
  fn: () => T,
): T {
  return grpcIdentityStorage.run(identity, fn);
}

export function getGrpcIdentity(): GrpcIdentity | null | undefined {
  return grpcIdentityStorage.getStore();
}
