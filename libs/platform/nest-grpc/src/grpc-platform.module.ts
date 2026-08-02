import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalRpcExceptionFilter } from './filters/rpc-exception.filter';
import { RequireIdentityGuard } from './guards/require-identity.guard';
import { InboundIdentityInterceptor } from './interceptors/inbound-identity.interceptor';
import { OutboundMetadataInterceptor } from './interceptors/outbound-metadata.interceptor';

export type GrpcPlatformOptions = {
  /**
   * 'server'  = gRPC service (auth/user/...) : แกะ metadata ขาเข้า + guard + filter
   * 'gateway' = HTTP edge                     : ยัด metadata ขาออก
   */
  role: 'server' | 'gateway';
};

@Module({})
export class GrpcPlatformModule {
  static forService(options: GrpcPlatformOptions): DynamicModule {
    const providers =
      options.role === 'gateway'
        ? [{ provide: APP_INTERCEPTOR, useClass: OutboundMetadataInterceptor }]
        : [
            { provide: APP_INTERCEPTOR, useClass: InboundIdentityInterceptor },
            { provide: APP_GUARD, useClass: RequireIdentityGuard },
            { provide: APP_FILTER, useClass: GlobalRpcExceptionFilter },
          ];

    return {
      module: GrpcPlatformModule,
      providers,
    };
  }
}
