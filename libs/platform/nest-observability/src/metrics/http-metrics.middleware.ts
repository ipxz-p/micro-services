import {Injectable, NestMiddleware} from '@nestjs/common';
import type {NextFunction, Request, Response}
from 'express';
import {MetricsRegistry} from './metrics.registry';

/**
 * นับ http_request_duration_seconds ทุก request ที่เข้า api-gateway
 */
@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
    constructor(private readonly metrics : MetricsRegistry) {}

    use(req : Request, res : Response, next : NextFunction): void {
        const start = process.hrtime.bigint();

        res.on('finish', () => {
            const durationSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000;
            const route = req.route ?. path ?? req.path;

            this.metrics.httpRequestDuration.observe({
                method: req.method,
                route,
                status_code: String(res.statusCode)
            }, durationSeconds,);
        });

        next();
    }
}
