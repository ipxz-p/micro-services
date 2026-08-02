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
  const grpcPort = config.getOrThrow<number>('grpc.authServicePort');
  const healthPort = config.getOrThrow<number>('health.authServicePort');

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth.v1',
        protoPath: join(__dirname, 'auth/v1/auth.proto'),
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
    .log(`auth-service gRPC :${grpcPort} | health :${healthPort}/health/live`);
}

bootstrap();
