import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from '@micro-service/nest-auth';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { HEALTH_INDICATORS, HEALTH_SERVICE_NAME } from './health.tokens';
import type { HealthIndicatorFn } from './health.tokens';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(HEALTH_SERVICE_NAME) private readonly serviceName: string,
    @Inject(HEALTH_INDICATORS)
    private readonly indicators: HealthIndicatorFn[],
  ) {}

  /** process ยังหายใจอยู่ ไม่แตะ dependency ภายนอกเลย */
  @Get('live')
  live() {
    return { status: 'ok', service: this.serviceName };
  }

  /** พร้อมรับ traffic — เช็ค dependency ทั้งหมดที่ลงทะเบียนไว้ */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check(this.indicators);
  }
}
