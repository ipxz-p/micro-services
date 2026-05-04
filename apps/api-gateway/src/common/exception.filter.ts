import { status } from '@grpc/grpc-js';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';

function isGrpcError(err: unknown): err is { code: number; details: string } {
  const e = err as any;
  return typeof e?.code === 'number' && typeof e?.details === 'string';
}

function mapGrpcErrorToHttp(err: unknown): HttpException {
  if (!isGrpcError(err)) {
    return new InternalServerErrorException('Internal server error');
  }

  const message = err.details || 'Request failed';

  switch (err.code) {
    case status.INVALID_ARGUMENT:
    case status.FAILED_PRECONDITION:
    case status.OUT_OF_RANGE:
      return new BadRequestException(message);

    case status.UNAUTHENTICATED:
      return new UnauthorizedException(message);

    case status.PERMISSION_DENIED:
      return new ForbiddenException(message);

    case status.NOT_FOUND:
      return new NotFoundException(message);

    case status.ALREADY_EXISTS:
    case status.ABORTED:
      return new ConflictException(message);

    case status.UNAVAILABLE:
    case status.DEADLINE_EXCEEDED:
      return new ServiceUnavailableException(message);

    default:
      return new InternalServerErrorException(message);
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();

    // 1. HTTP exceptions (DTO validation, BadRequest, etc.)
    if (exception?.getStatus) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return res.status(status).json({
        statusCode: status,
        message: response?.message || exception.message,
      });
    }

    // 2. gRPC errors
    const err = mapGrpcErrorToHttp(exception);

    return res.status(err.getStatus()).json({
      statusCode: err.getStatus(),
      message: err.message,
    });
  }
}