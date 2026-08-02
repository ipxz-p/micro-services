import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';
import { runWithGrpcContext } from '../context/grpc-context';
import {
  parseCorrelationId,
  parseIdentity,
} from '../metadata/grpc-metadata.util';

@Injectable()
export class InboundIdentityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const metadata = context.switchToRpc().getContext<Metadata>();

    return new Observable((subscriber) => {
      runWithGrpcContext(
        {
          metadata,
          identity: parseIdentity(metadata),
          correlationId: parseCorrelationId(metadata),
        },
        () => {
          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          });
        },
      );
    });
  }
}
