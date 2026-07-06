export * from './generated/user/v1/user';

export {
  AUTH_SERVICE_NAME,
  AUTH_V1_PACKAGE_NAME,
  AuthServiceControllerMethods,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from './generated/auth/v1/auth';

export type {
  AuthServiceClient,
  AuthServiceController,
} from './generated/auth/v1/auth';
