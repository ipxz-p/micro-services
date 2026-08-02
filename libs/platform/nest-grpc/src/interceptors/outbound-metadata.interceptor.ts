import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  HTTP_HEADER_CORRELATION_ID,
  type ServiceIdentity,
} from '@micro-service/service-identity';
import { runWithGrpcContext } from '../context/grpc-context';
import { buildGrpcMetadata } from '../metadata/grpc-metadata.util';

type AuthenticatedRequest = {
  user?: { sub: number; email: string };
  correlationId?: string;
  id?: string;
  headers?: Record<string, string | string[] | undefined>;
};

function resolveCorrelationId(req: AuthenticatedRequest): string | undefined {
  if (req.correlationId) return req.correlationId;
  if (typeof req.id === 'string' && req.id) return req.id;
  const header = req.headers?.[HTTP_HEADER_CORRELATION_ID];
  if (typeof header === 'string' && header.trim()) return header.trim();
  return undefined;
}

@Injectable()
export class OutboundMetadataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const identity: ServiceIdentity | null = request.user
      ? { userId: String(request.user.sub), userEmail: request.user.email }
      : null;

    const correlationId = resolveCorrelationId(request);
    const metadata = buildGrpcMetadata(identity, correlationId);

    return new Observable((subscriber) => {
      runWithGrpcContext(
        { metadata, identity, correlationId },
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
