import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const grpcPort = process.env.GRPC_PORT ?? '50051';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user.v1',
        protoPath: join(__dirname, 'proto/user/v1/user.proto'),
        url: `0.0.0.0:${grpcPort}`,
      },
    },
  );
  app.enableShutdownHooks();
  await app.listen();
  Logger.log(`User service gRPC listening on 0.0.0.0:${grpcPort}`);
}

bootstrap();
