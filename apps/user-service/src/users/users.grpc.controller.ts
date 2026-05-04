import { status } from '@grpc/grpc-js';
import { BadRequestException, Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersGrpcController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(request: { email: string; password: string }) {
    try {
      const created = await this.usersService.create({
        email: request.email,
        password: request.password,
      } as CreateUserDto);
      return { id: created.id, email: created.email };
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: e.message,
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: e instanceof Error ? e.message : 'Internal error',
      });
    }
  }

  @GrpcMethod('UserService', 'ListUsers')
  async listUsers() {
    const rows = await this.usersService.findAll();
    return {
      users: rows.map((u) => ({ id: u.id, email: u.email })),
    };
  }
}
