import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CreateUserRequest,
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@micro-service/proto-contracts';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
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

  @Post()
  create(@Body() dto: CreateUserDto) {
    const req: CreateUserRequest = {
      email: dto.email,
      password: dto.password,
    };
    return firstValueFrom(this.userGrpc.createUser(req));
  }

  @Get()
  async findAll() {
    const res = await firstValueFrom(this.userGrpc.listUsers({}));
    return res.users ?? [];
  }
}
