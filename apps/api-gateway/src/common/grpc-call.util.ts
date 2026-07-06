import { Metadata } from '@grpc/grpc-js';
import { Observable, firstValueFrom } from 'rxjs';
import { cloneGrpcMetadata, getGrpcMetadata } from './grpc-context';

export function callGrpc<T>(
  call: (metadata: Metadata) => Observable<T>,
  extend?: (metadata: Metadata) => void,
): Promise<T> {
  const existing = getGrpcMetadata();
  const metadata = existing ? cloneGrpcMetadata(existing) : new Metadata();

  extend?.(metadata);
  return firstValueFrom(call(metadata));
}
