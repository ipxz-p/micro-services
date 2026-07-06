import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const grpcPort = process.env.GRPC_PORT ?? '50052';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth.v1',
        protoPath: join(__dirname, 'auth/v1/auth.proto'),
        url: `0.0.0.0:${grpcPort}`,
      },
    },
  );
  app.enableShutdownHooks();
  await app.listen();
  Logger.log(`Auth service gRPC listening on 0.0.0.0:${grpcPort}`);
}

bootstrap();
