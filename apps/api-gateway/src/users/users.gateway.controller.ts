import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { USER_SERVICE_NAME, UserServiceClient } from '@micro-service/proto-contracts/user/v1/user';
import { callGrpc } from '@micro-service/nest-grpc';
import { USER_SERVICE_GRPC } from '@micro-service/nest-grpc';

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
