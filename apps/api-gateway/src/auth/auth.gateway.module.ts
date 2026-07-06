import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_SERVICE_GRPC } from './auth-grpc.constants';
import { AuthGatewayController } from './auth.gateway.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_GRPC,
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth.v1',
            protoPath: join(__dirname, 'auth/v1/auth.proto'),
            url: config.get<string>(
              'AUTH_SERVICE_GRPC_URL',
              '127.0.0.1:50052',
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthGatewayController],
})
export class AuthGatewayModule {}
