import type { HealthIndicatorResult } from '@nestjs/terminus';

export const HEALTH_INDICATORS = Symbol('HEALTH_INDICATORS');
export const HEALTH_SERVICE_NAME = Symbol('HEALTH_SERVICE_NAME');

export type HealthIndicatorFn = () => Promise<HealthIndicatorResult>;
