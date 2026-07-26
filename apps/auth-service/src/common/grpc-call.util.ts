import { Metadata } from '@grpc/grpc-js';
import { Observable, firstValueFrom } from 'rxjs';
import { cloneGrpcMetadata, getGrpcMetadata } from './grpc-context';

export function callGrpc<T>(
  call: (metadata: Metadata) => Observable<T>,
): Promise<T> {
  const existing = getGrpcMetadata();
  const metadata = existing ? cloneGrpcMetadata(existing) : new Metadata();
  return firstValueFrom(call(metadata));
}
