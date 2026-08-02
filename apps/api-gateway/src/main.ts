import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './common/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: false,
      exceptionFactory: (errors) =>
        new BadRequestException(
          errors.map((e) => Object.values(e.constraints || {})).flat(),
        ),
    }),
  );

  app.setGlobalPrefix('api', { exclude: ['health/(.*)'] });

  app.enableShutdownHooks();

  const port = app.get(ConfigService).getOrThrow<number>('http.gatewayPort');
  await app.listen(port);

  app
    .get(Logger)
    .log(`api-gateway http://localhost:${port}/api | health /health/live`);
}

bootstrap();
