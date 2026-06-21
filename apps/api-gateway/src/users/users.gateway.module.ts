import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { USER_SERVICE_GRPC } from './user-grpc.constants';
import { UsersGatewayController } from './users.gateway.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: USER_SERVICE_GRPC,
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => (
          {
          transport: Transport.GRPC,
          options: {
            package: 'user.v1',
            protoPath: join(__dirname, 'user/v1/user.proto'),
            url: config.get<string>('USER_SERVICE_GRPC_URL', '127.0.0.1:50051'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UsersGatewayController],
})
export class UsersGatewayModule {}
