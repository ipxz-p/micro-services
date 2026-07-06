import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserGrpcModule } from '../users/user-grpc.module';
import { AuthGrpcController } from './auth.grpc.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserGrpcModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthGrpcController],
  providers: [AuthService],
})
export class AuthModule {}
