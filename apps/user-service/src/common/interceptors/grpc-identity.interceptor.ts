import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';
import { runWithGrpcIdentity } from '../grpc-context';
import {
  GRPC_METADATA_CORRELATION_ID,
  parseIdentity,
} from '../grpc-identity';
import { runWithGrpcRequestContext } from '../grpc-request-context';

@Injectable()
export class GrpcIdentityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const metadata = context.switchToRpc().getContext<Metadata>();
    const identity = parseIdentity(metadata);
    const correlationId = metadata?.get(GRPC_METADATA_CORRELATION_ID)?.[0];
    const requestContext = {
      correlationId:
        typeof correlationId === 'string' ? correlationId : undefined,
    };

    return new Observable((subscriber) => {
      runWithGrpcRequestContext(requestContext, () => {
        runWithGrpcIdentity(identity, () => {
          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          });
        });
      });
    });
  }
}
