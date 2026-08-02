import { Controller } from '@nestjs/common';
import { AllowAnonymous } from '@micro-service/nest-grpc';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from '@micro-service/proto-contracts/auth/v1/auth';
import { from, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@AuthServiceControllerMethods()
@Controller()
export class AuthGrpcController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @AllowAnonymous()
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return from(this.authService.register(request));
  }

  @AllowAnonymous()
  login(request: LoginRequest): Observable<LoginResponse> {
    return from(this.authService.login(request));
  }

  @AllowAnonymous()
  refreshToken(request: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return from(this.authService.refreshToken(request));
  }
}
