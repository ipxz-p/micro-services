import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { AccessTokenPayload } from '../../auth/types/access-token-payload';
import { runWithGrpcMetadata } from '../grpc-context';
import { buildGrpcMetadata } from '../grpc-metadata.util';

@Injectable()
export class GrpcMetadataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{
      user?: AccessTokenPayload;
      correlationId?: string;
    }>();

    const metadata = buildGrpcMetadata(request.user, request.correlationId);

    if (Object.keys(metadata.getMap()).length === 0) {
      return next.handle();
    }

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
