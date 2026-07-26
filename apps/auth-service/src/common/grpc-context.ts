import { Metadata } from '@grpc/grpc-js';
import { AsyncLocalStorage } from 'async_hooks';

const grpcMetadataStorage = new AsyncLocalStorage<Metadata>();

export function runWithGrpcMetadata<T>(metadata: Metadata, fn: () => T): T {
  return grpcMetadataStorage.run(metadata, fn);
}

export function getGrpcMetadata(): Metadata | undefined {
  return grpcMetadataStorage.getStore();
}

export function cloneGrpcMetadata(metadata: Metadata): Metadata {
  const cloned = new Metadata();
  for (const [key, values] of Object.entries(metadata.getMap())) {
    for (const value of values) {
      cloned.add(key, String(value));
    }
  }
  return cloned;
}
