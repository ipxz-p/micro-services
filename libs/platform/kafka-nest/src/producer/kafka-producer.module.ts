import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KAFKA_CLIENT_ID } from '../kafka.tokens';
import type { KafkaProducerModuleOptions } from '../kafka.types';
import { KafkaProducerService } from './kafka-producer.service';

type AsyncOptions = {
  imports?: DynamicModule['imports'];
  inject?: unknown[];
  useFactory: (
    ...args: never[]
  ) => KafkaProducerModuleOptions | Promise<KafkaProducerModuleOptions>;
};

@Module({})
export class KafkaProducerModule {
  static forRoot(options: KafkaProducerModuleOptions): DynamicModule {
    return {
      module: KafkaProducerModule,
      imports: [ConfigModule],
      providers: [
        { provide: KAFKA_CLIENT_ID, useValue: options.clientId },
        KafkaProducerService,
      ],
      exports: [KafkaProducerService],
    };
  }

  static forRootAsync(options: AsyncOptions): DynamicModule {
    return {
      module: KafkaProducerModule,
      imports: [ConfigModule, ...(options.imports ?? [])],
      providers: [
        {
          provide: KAFKA_CLIENT_ID,
          useFactory: async (...args: never[]) =>
            (await options.useFactory(...args)).clientId,
          inject: (options.inject ?? []) as never[],
        },
        KafkaProducerService,
      ],
      exports: [KafkaProducerService],
    };
  }
}
