import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { USER_SERVICE_GRPC } from './user-grpc.constants';

interface UserServiceGrpc {
  createUser(data: {
    email: string;
    password: string;
  }): Observable<{ id: number; email: string }>;
  listUsers(data: object): Observable<{
    users: Array<{ id: number; email: string }>;
  }>;
}

@Controller('users')
export class UsersGatewayController implements OnModuleInit {
  private userGrpc!: UserServiceGrpc;

  constructor(@Inject(USER_SERVICE_GRPC) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userGrpc = this.client.getService<UserServiceGrpc>('UserService');
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return firstValueFrom(
      this.userGrpc.createUser({
        email: dto.email,
        password: dto.password,
      }),
    );
  }

  @Get()
  async findAll() {
    const res = await firstValueFrom(this.userGrpc.listUsers({}));
    return res.users ?? [];
  }
}
