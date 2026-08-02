import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { USER_SERVICE_GRPC, createGrpcClients } from '@micro-service/nest-grpc';
import { UsersGatewayController } from './users.gateway.controller';

@Module({
  imports: [
    ClientsModule.registerAsync(
      createGrpcClients(__dirname, [
        {
          token: USER_SERVICE_GRPC,
          packageName: 'user.v1',
          protoPath: 'user/v1/user.proto',
          urlConfigKey: 'userServiceUrl',
        },
      ]),
    ),
  ],
  controllers: [UsersGatewayController],
})
export class UsersGatewayModule {}
