import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';
import { runWithGrpcMetadata } from '../grpc-context';

@Injectable()
export class GrpcMetadataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const metadata = context.switchToRpc().getContext<Metadata>();

    return new Observable((subscriber) => {
      runWithGrpcMetadata(metadata, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
