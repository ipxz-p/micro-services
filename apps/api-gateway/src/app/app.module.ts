import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, JwtSharedModule } from '@micro-service/nest-auth';
import {
  PlatformConfigModule,
  appConfig,
  appEnvShape,
  grpcClientEnvShape,
  grpcConfig,
  httpConfig,
  httpEnvShape,
  jwtConfig,
  jwtEnvShape,
} from '@micro-service/nest-config';
import { GrpcPlatformModule } from '@micro-service/nest-grpc';
import {
  CorrelationIdMiddleware,
  HealthModule,
  HttpMetricsMiddleware,
  LoggingModule,
  MetricsModule,
} from '@micro-service/nest-observability';
import { AuthGatewayModule } from '../auth/auth.gateway.module';
import { UsersGatewayModule } from '../users/users.gateway.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PlatformConfigModule.forService({
      serviceName: 'api-gateway',
      load: [appConfig, httpConfig, grpcConfig, jwtConfig],
      envShape: {
        ...appEnvShape,
        ...httpEnvShape,
        ...grpcClientEnvShape,
        ...jwtEnvShape,
      },
    }),
    LoggingModule.forService({ serviceName: 'api-gateway' }),
    GrpcPlatformModule.forService({ role: 'gateway' }),
    HealthModule.forService({ serviceName: 'api-gateway' }),
    MetricsModule.forService(),
    JwtSharedModule,
    AuthGatewayModule,
    UsersGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, HttpMetricsMiddleware)
      .forRoutes({ path: '*splat', method: RequestMethod.ALL });
  }
}
