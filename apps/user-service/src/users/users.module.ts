import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { RequireIdentityGuard } from '../common/guards/require-identity.guard';
import { GrpcIdentityInterceptor } from '../common/interceptors/grpc-identity.interceptor';
import { UsersGrpcController } from './users.grpc.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersGrpcController],
  providers: [
    UsersService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcIdentityInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RequireIdentityGuard,
    },
  ],
})
export class UsersModule {}
