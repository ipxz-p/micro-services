import { status } from '@grpc/grpc-js';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ForbiddenException,
  HttpException,
  Logger,
  NotFoundException,
  RpcExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

const HTTP_TO_GRPC: Array<[new (...args: never[]) => HttpException, number]> = [
  [BadRequestException, status.INVALID_ARGUMENT],
  [UnauthorizedException, status.UNAUTHENTICATED],
  [ForbiddenException, status.PERMISSION_DENIED],
  [NotFoundException, status.NOT_FOUND],
  [ConflictException, status.ALREADY_EXISTS],
];

@Catch()
export class GlobalRpcExceptionFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(GlobalRpcExceptionFilter.name);

  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    if (exception instanceof HttpException) {
      const match = HTTP_TO_GRPC.find(([type]) => exception instanceof type);
      const code = match ? match[1] : status.INTERNAL;

      if (code === status.INTERNAL) {
        this.logger.error(exception.message, exception.stack);
      }

      return throwError(() => ({ code, message: exception.message }));
    }

    // อะไรก็ตามที่ไม่รู้จัก = INTERNAL และต้อง log เสมอ
    this.logger.error(
      exception instanceof Error ? exception.message : String(exception),
      exception instanceof Error ? exception.stack : undefined,
    );

    return throwError(() => ({
      code: status.INTERNAL,
      message: 'Internal server error',
    }));
  }
}
