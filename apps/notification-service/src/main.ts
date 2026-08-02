import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const healthPort = app
    .get(ConfigService)
    .getOrThrow<number>('health.notificationServicePort');

  app.enableShutdownHooks();
  await app.listen(healthPort);

  app
    .get(Logger)
    .log(`notification-service (Kafka consumer) | health :${healthPort}`);
}

bootstrap();
