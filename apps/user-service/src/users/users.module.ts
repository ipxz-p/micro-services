import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersGrpcController } from './users.grpc.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersGrpcController],
  providers: [UsersService],
})
export class UsersModule {}
