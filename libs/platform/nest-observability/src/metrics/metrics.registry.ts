import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsRegistry implements OnModuleDestroy {
    readonly registry: client.Registry;

    readonly httpRequestDuration: client.Histogram<
        'method' | 'route' | 'status_code'
    >;

    readonly grpcRequestDuration: client.Histogram<
        'method' | 'status_code'
    >;

    constructor() {
        this.registry = new client.Registry();
        client.collectDefaultMetrics({ register: this.registry });

        this.httpRequestDuration = new client.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
            registers: [this.registry],
        });
        
        this.grpcRequestDuration = new client.Histogram({
            name: 'grpc_request_duration_seconds',
            help: 'Duration of gRPC requests in seconds',
            labelNames: ['method', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
            registers: [this.registry],
        });
    }

    onModuleDestroy() {
        this.registry.clear();
    }
}