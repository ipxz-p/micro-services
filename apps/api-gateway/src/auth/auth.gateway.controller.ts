import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from '@micro-service/proto-contracts/auth/v1/auth';
import { callGrpc } from '@micro-service/nest-grpc';
import { Public } from '@micro-service/nest-auth';
import { AUTH_SERVICE_GRPC } from '@micro-service/nest-grpc';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthGatewayController implements OnModuleInit {
  private authGrpc!: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE_GRPC) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authGrpc = this.client.getService<AuthServiceClient>(
      AUTH_SERVICE_NAME,
    );
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    const req: RegisterRequest = {
      email: dto.email,
      password: dto.password,
    };
    return callGrpc((metadata) => this.authGrpc.register(req, metadata));
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    const req: LoginRequest = {
      email: dto.email,
      password: dto.password,
    };
    return callGrpc((metadata) => this.authGrpc.login(req, metadata));
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    const req: RefreshTokenRequest = {
      refreshToken: dto.refreshToken,
    };
    return callGrpc((metadata) => this.authGrpc.refreshToken(req, metadata));
  }
}
