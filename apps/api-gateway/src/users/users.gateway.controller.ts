import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { USER_SERVICE_NAME, UserServiceClient } from '@micro-service/proto-contracts';
import { callGrpc } from '../common/grpc-call.util';
import { USER_SERVICE_GRPC } from './user-grpc.constants';

@Controller('users')
export class UsersGatewayController implements OnModuleInit {
  private userGrpc!: UserServiceClient;

  constructor(@Inject(USER_SERVICE_GRPC) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userGrpc = this.client.getService<UserServiceClient>(
      USER_SERVICE_NAME,
    );
  }

  @Get()
  async findAll() {
    const res = await callGrpc((metadata) =>
      this.userGrpc.listUsers({}, metadata),
    );
    return res.users ?? [];
  }
}
