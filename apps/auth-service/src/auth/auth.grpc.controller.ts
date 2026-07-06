import { status } from '@grpc/grpc-js';
import { Controller, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from '@micro-service/proto-contracts';
import { from, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@AuthServiceControllerMethods()
@Controller()
export class AuthGrpcController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return from(this.authService.register(request)).pipe(
      catchError((e) => this.mapError(e)),
    );
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return from(this.authService.login(request)).pipe(
      catchError((e) => this.mapError(e)),
    );
  }

  refreshToken(
    request: RefreshTokenRequest,
  ): Observable<RefreshTokenResponse> {
    return from(this.authService.refreshToken(request)).pipe(
      catchError((e) => this.mapError(e)),
    );
  }

  private mapError(e: unknown) {
    if (e instanceof UnauthorizedException) {
      return throwError(
        () =>
          new RpcException({
            code: status.UNAUTHENTICATED,
            message: e.message,
          }),
      );
    }
    if (e instanceof RpcException) {
      return throwError(() => e);
    }
    return throwError(
      () =>
        new RpcException({
          code: status.INTERNAL,
          message: e instanceof Error ? e.message : 'Internal error',
        }),
    );
  }
}
