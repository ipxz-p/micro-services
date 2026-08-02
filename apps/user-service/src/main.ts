import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const grpcPort = config.getOrThrow<number>('grpc.userServicePort');
  const healthPort = config.getOrThrow<number>('health.userServicePort');

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: 'user.v1',
        protoPath: join(__dirname, 'user/v1/user.proto'),
        url: `0.0.0.0:${grpcPort}`,
      },
    },
    { inheritAppConfig: true },
  );

  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(healthPort);

  app
    .get(Logger)
    .log(`user-service gRPC :${grpcPort} | health :${healthPort}/health/live`);
}

bootstrap();
