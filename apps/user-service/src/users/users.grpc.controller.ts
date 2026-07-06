import { status } from '@grpc/grpc-js';
import { BadRequestException, Controller } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUserByEmailRequest,
  GetUserByEmailResponse,
  ListUsersRequest,
  ListUsersResponse,
  UserServiceController,
  UserServiceControllerMethods,
  VerifyCredentialsRequest,
  VerifyCredentialsResponse,
} from '@micro-service/proto-contracts';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RequireIdentity } from '../common/decorators/require-identity.decorator';
import { UsersService } from './users.service';

@UserServiceControllerMethods()
@Controller()
export class UsersGrpcController implements UserServiceController {
  constructor(private readonly usersService: UsersService) {}

  getUserByEmail(
    request: GetUserByEmailRequest,
  ): Observable<GetUserByEmailResponse> {
    return from(this.usersService.getUserByEmail(request.email)).pipe(
      map((result) => ({
        found: result.found,
        id: result.id ?? 0,
        email: result.email ?? '',
      })),
    );
  }

  createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
    return from(
      this.usersService.createWithHashedPassword({
        email: request.email,
        passwordHash: request.passwordHash,
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

  verifyCredentials(
    request: VerifyCredentialsRequest,
  ): Observable<VerifyCredentialsResponse> {
    return from(
      this.usersService.verifyCredentials({
        email: request.email,
        password: request.password,
      }),
    ).pipe(
      map((result) => ({
        valid: result.valid,
        id: result.id ?? 0,
        email: result.email ?? '',
      })),
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
