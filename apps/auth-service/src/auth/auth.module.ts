import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GrpcMetadataInterceptor } from '../common/interceptors/grpc-metadata.interceptor';
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
  providers: [
    AuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcMetadataInterceptor,
    },
  ],
})
export class AuthModule {}
