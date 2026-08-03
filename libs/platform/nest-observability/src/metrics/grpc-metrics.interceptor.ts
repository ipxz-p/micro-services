import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { status as grpcStatus } from '@grpc/grpc-js';
import { Observable, tap } from 'rxjs';
import { MetricsRegistry } from './metrics.registry';

@Injectable()
export class GrpcMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsRegistry) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const start = process.hrtime.bigint();
    const method = context.getHandler().name;

    const observe = (statusCode: number) => {
      const durationSeconds =
        Number(process.hrtime.bigint() - start) / 1_000_000_000;
      this.metrics.grpcRequestDuration.observe(
        { method, status_code: String(statusCode) },
        durationSeconds,
      );
    };

    return next.handle().pipe(
      tap({
        next: () => observe(grpcStatus.OK),
        error: (error: unknown) => {
          const code =
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            typeof (error as { code: unknown }).code === 'number'
              ? (error as { code: number }).code
              : grpcStatus.UNKNOWN;
          observe(code);
        },
      }),
    );
  }
}
