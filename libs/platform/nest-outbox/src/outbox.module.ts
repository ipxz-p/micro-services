import { DynamicModule, Module, Provider } from '@nestjs/common';
import { OutboxRelayService } from './outbox-relay.service';

export type OutboxModuleOptions = {
  store: Provider;
  imports?: DynamicModule['imports'];
};

@Module({})
export class OutboxModule {
  static forService(options: OutboxModuleOptions): DynamicModule {
    return {
      module: OutboxModule,
      imports: options.imports ?? [],
      providers: [options.store, OutboxRelayService],
      exports: [OutboxRelayService],
    };
  }
}
