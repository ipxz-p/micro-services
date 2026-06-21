import { status } from '@grpc/grpc-js';
import { BadRequestException, Controller } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  CreateUserRequest,
  CreateUserResponse,
  ListUsersRequest,
  ListUsersResponse,
  UserServiceController,
  UserServiceControllerMethods,
} from '@micro-service/proto-contracts';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UsersService } from './users.service';

@UserServiceControllerMethods()
@Controller()
export class UsersGrpcController implements UserServiceController {
  constructor(private readonly usersService: UsersService) {}

  createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
    return from(
      this.usersService.create({
        email: request.email,
        password: request.password,
      }),
    ).pipe(
      map((created) => ({ id: created.id, email: created.email })),
      catchError((e) => {
        if (e instanceof BadRequestException) {
          return throwError(
            () =>
              new RpcException({
                code: status.ALREADY_EXISTS,
                message: e.message,
              }),
          );
        }
        return throwError(
          () =>
            new RpcException({
              code: status.INTERNAL,
              message: e instanceof Error ? e.message : 'Internal error',
            }),
        );
      }),
    );
  }

  listUsers(_request: ListUsersRequest): Observable<ListUsersResponse> {
    return from(this.usersService.findAll()).pipe(
      map((rows) => ({
        users: rows.map((u) => ({ id: u.id, email: u.email })),
      })),
    );
  }
}
