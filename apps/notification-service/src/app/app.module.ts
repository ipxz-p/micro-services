import { Module } from '@nestjs/common';
import {
  PlatformConfigModule,
  appConfig,
  appEnvShape,
  healthConfig,
  healthEnvShape,
  kafkaConfig,
  kafkaEnvShape,
  notificationDatabaseConfig,
  notificationDbEnvShape,
} from '@micro-service/nest-config';
import {
  HEALTH_INDICATORS,
  HealthModule,
  LoggingModule,
} from '@micro-service/nest-observability';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PlatformConfigModule.forService({
      serviceName: 'notification-service',
      load: [appConfig, healthConfig, kafkaConfig, notificationDatabaseConfig],
      envShape: {
        ...appEnvShape,
        ...healthEnvShape,
        ...kafkaEnvShape,
        ...notificationDbEnvShape,
      },
    }),
    LoggingModule.forService({ serviceName: 'notification-service' }),
    HealthModule.forService({
      serviceName: 'notification-service',
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
    NotificationsModule,
  ],
})
export class AppModule {}
