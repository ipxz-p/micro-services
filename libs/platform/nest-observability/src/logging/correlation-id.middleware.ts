import { randomUUID } from 'crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { HTTP_HEADER_CORRELATION_ID } from '@micro-service/service-identity';
import type { NextFunction, Request, Response } from 'express';

/**
 * รับ correlation id จาก client ถ้ามี ไม่มีก็สร้างใหม่
 * แล้วแนบกลับใน response header เพื่อให้ client อ้างอิงได้เวลาแจ้งปัญหา
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[HTTP_HEADER_CORRELATION_ID];
    const correlationId =
      typeof incoming === 'string' && incoming.trim()
        ? incoming.trim()
        : randomUUID();

    (req as Request & { correlationId?: string }).correlationId = correlationId;
    res.setHeader(HTTP_HEADER_CORRELATION_ID, correlationId);
    next();
  }
}
