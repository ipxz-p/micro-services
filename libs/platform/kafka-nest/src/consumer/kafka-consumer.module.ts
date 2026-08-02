import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  KAFKA_CLIENT_ID,
  KAFKA_CONSUMER_OPTIONS,
  KAFKA_GROUP_ID,
} from '../kafka.tokens';
import type { KafkaConsumerModuleOptions } from '../kafka.types';
import { KafkaConsumerService } from './kafka-consumer.service';

type AsyncOptions = {
  imports?: DynamicModule['imports'];
  inject?: Provider extends never ? never[] : unknown[];
  useFactory: (
    ...args: never[]
  ) => KafkaConsumerModuleOptions | Promise<KafkaConsumerModuleOptions>;
};

const derivedProviders: Provider[] = [
  {
    provide: KAFKA_CLIENT_ID,
    useFactory: (o: KafkaConsumerModuleOptions) => o.clientId,
    inject: [KAFKA_CONSUMER_OPTIONS],
  },
  {
    provide: KAFKA_GROUP_ID,
    useFactory: (o: KafkaConsumerModuleOptions) => o.groupId,
    inject: [KAFKA_CONSUMER_OPTIONS],
  },
];

@Module({})
export class KafkaConsumerModule {
  static forRoot(options: KafkaConsumerModuleOptions): DynamicModule {
    return {
      module: KafkaConsumerModule,
      imports: [ConfigModule],
      providers: [
        { provide: KAFKA_CONSUMER_OPTIONS, useValue: options },
        ...derivedProviders,
        KafkaConsumerService,
      ],
      exports: [KafkaConsumerService],
    };
  }

  static forRootAsync(options: AsyncOptions): DynamicModule {
    return {
      module: KafkaConsumerModule,
      imports: [ConfigModule, ...(options.imports ?? [])],
      providers: [
        {
          provide: KAFKA_CONSUMER_OPTIONS,
          useFactory: options.useFactory,
          inject: (options.inject ?? []) as never[],
        },
        ...derivedProviders,
        KafkaConsumerService,
      ],
      exports: [KafkaConsumerService],
    };
  }
}
