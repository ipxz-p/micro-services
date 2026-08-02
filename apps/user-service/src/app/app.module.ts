import { Module } from '@nestjs/common';
import {
  PlatformConfigModule,
  appConfig,
  appEnvShape,
  grpcConfig,
  grpcServerEnvShape,
  healthConfig,
  healthEnvShape,
  kafkaConfig,
  kafkaEnvShape,
  userDatabaseConfig,
  userDbEnvShape,
} from '@micro-service/nest-config';
import { GrpcPlatformModule } from '@micro-service/nest-grpc';
import {
  HEALTH_INDICATORS,
  HealthModule,
  LoggingModule,
} from '@micro-service/nest-observability';
import { UserOutboxModule } from '../outbox/outbox.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PlatformConfigModule.forService({
      serviceName: 'user-service',
      load: [
        appConfig,
        grpcConfig,
        healthConfig,
        kafkaConfig,
        userDatabaseConfig,
      ],
      envShape: {
        ...appEnvShape,
        ...grpcServerEnvShape,
        ...healthEnvShape,
        ...kafkaEnvShape,
        ...userDbEnvShape,
      },
    }),
    LoggingModule.forService({ serviceName: 'user-service' }),
    GrpcPlatformModule.forService({ role: 'server' }),
    HealthModule.forService({
      serviceName: 'user-service',
      imports: [PrismaModule],
      indicators: {
        provide: HEALTH_INDICATORS,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) => [
          async () => {
            await prisma.$queryRaw`SELECT 1`;
            return { database: { status: 'up' as const } };
          },
        ],
      },
    }),
    PrismaModule,
    UsersModule,
    UserOutboxModule,
  ],
})
export class AppModule {}
