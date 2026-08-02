import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH_SERVICE_GRPC, createGrpcClients } from '@micro-service/nest-grpc';
import { AuthGatewayController } from './auth.gateway.controller';

@Module({
  imports: [
    ClientsModule.registerAsync(
      createGrpcClients(__dirname, [
        {
          token: AUTH_SERVICE_GRPC,
          packageName: 'auth.v1',
          protoPath: 'auth/v1/auth.proto',
          urlConfigKey: 'authServiceUrl',
        },
      ]),
    ),
  ],
  controllers: [AuthGatewayController],
})
export class AuthGatewayModule {}
