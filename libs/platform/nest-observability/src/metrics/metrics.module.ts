import { DynamicModule, Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsRegistry } from './metrics.registry';

@Module({})
export class MetricsModule {
  static forService(): DynamicModule {
    return {
      module: MetricsModule,
      controllers: [MetricsController],
      providers: [MetricsRegistry],
      exports: [MetricsRegistry],
    };
  }
}