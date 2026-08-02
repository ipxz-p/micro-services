import { Controller } from '@nestjs/common';
import { AllowAnonymous } from '@micro-service/nest-grpc';
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
} from '@micro-service/proto-contracts/user/v1/user';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsersService } from './users.service';

@UserServiceControllerMethods()
@Controller()
export class UsersGrpcController implements UserServiceController {
  constructor(private readonly usersService: UsersService) {}

  @AllowAnonymous()
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

  @AllowAnonymous()
  createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
    return from(
      this.usersService.createWithHashedPassword({
        email: request.email,
        passwordHash: request.passwordHash,
      }),
    ).pipe(map((created) => ({ id: created.id, email: created.email })));
  }

  @AllowAnonymous()
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
