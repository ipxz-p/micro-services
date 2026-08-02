import { Module } from '@nestjs/common';
import { JwtSharedModule } from '@micro-service/nest-auth';
import { UserGrpcModule } from '../users/user-grpc.module';
import { AuthGrpcController } from './auth.grpc.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserGrpcModule, JwtSharedModule],
  controllers: [AuthGrpcController],
  providers: [AuthService],
})
export class AuthModule {}
