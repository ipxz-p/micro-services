import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KAFKA_CLIENT_ID, KAFKA_GROUP_ID } from '../kafka.tokens';
import type { KafkaConsumerModuleOptions } from '../kafka.types';
import { KafkaConsumerService } from './kafka-consumer.service';

@Module({})
export class KafkaConsumerModule {
  static forRoot(options: KafkaConsumerModuleOptions): DynamicModule {
    return {
      module: KafkaConsumerModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: KAFKA_CLIENT_ID,
          useValue: options.clientId,
        },
        {
          provide: KAFKA_GROUP_ID,
          useValue: options.groupId,
        },
        KafkaConsumerService,
      ],
      exports: [KafkaConsumerService],
    };
  }
}
