import { Module } from '@nestjs/common';
import {
  PlatformConfigModule,
  appConfig,
  appEnvShape,
  grpcClientEnvShape,
  grpcConfig,
  grpcServerEnvShape,
  healthConfig,
  healthEnvShape,
  jwtConfig,
  jwtEnvShape,
} from '@micro-service/nest-config';
import { GrpcPlatformModule } from '@micro-service/nest-grpc';
import { HealthModule, LoggingModule } from '@micro-service/nest-observability';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PlatformConfigModule.forService({
      serviceName: 'auth-service',
      load: [appConfig, grpcConfig, healthConfig, jwtConfig],
      envShape: {
        ...appEnvShape,
        ...grpcServerEnvShape,
        ...grpcClientEnvShape,
        ...healthEnvShape,
        ...jwtEnvShape,
      },
    }),
    LoggingModule.forService({ serviceName: 'auth-service' }),
    GrpcPlatformModule.forService({ role: 'server' }),
    HealthModule.forService({ serviceName: 'auth-service' }),
    AuthModule,
  ],
})
export class AppModule {}
