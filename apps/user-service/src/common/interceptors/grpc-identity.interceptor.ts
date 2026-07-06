import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';
import { runWithGrpcIdentity } from '../grpc-context';
import { parseIdentity } from '../grpc-identity';

@Injectable()
export class GrpcIdentityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const metadata = context.switchToRpc().getContext<Metadata>();
    const identity = parseIdentity(metadata);

    return new Observable((subscriber) => {
      runWithGrpcIdentity(identity, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
