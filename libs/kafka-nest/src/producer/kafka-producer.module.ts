import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KAFKA_CLIENT_ID } from '../kafka.tokens';
import type { KafkaProducerModuleOptions } from '../kafka.types';
import { KafkaProducerService } from './kafka-producer.service';

@Module({})
export class KafkaProducerModule {
  static forRoot(options: KafkaProducerModuleOptions): DynamicModule {
    return {
      module: KafkaProducerModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: KAFKA_CLIENT_ID,
          useValue: options.clientId,
        },
        KafkaProducerService,
      ],
      exports: [KafkaProducerService],
    };
  }
}
