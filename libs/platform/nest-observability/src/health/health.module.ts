import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HEALTH_INDICATORS, HEALTH_SERVICE_NAME } from './health.tokens';
import type { HealthIndicatorFn } from './health.tokens';

export type HealthOptions = {
  serviceName: string;
  indicators?: Provider;
  imports?: DynamicModule['imports'];
};

/**
 * /health/live  = process ยังอยู่ไหม        -> orchestrator ใช้ตัดสินใจ restart
 * /health/ready = พร้อมรับ traffic ไหม      -> ใช้ตัดสินใจส่ง traffic เข้า
 */
@Module({})
export class HealthModule {
  static forService(options: HealthOptions): DynamicModule {
    return {
      module: HealthModule,
      imports: [TerminusModule, ...(options.imports ?? [])],
      controllers: [HealthController],
      providers: [
        { provide: HEALTH_SERVICE_NAME, useValue: options.serviceName },
        options.indicators ?? {
          provide: HEALTH_INDICATORS,
          useValue: [] as HealthIndicatorFn[],
        },
      ],
    };
  }
}
