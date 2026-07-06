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
} from '@micro-service/proto-contracts';
import { firstValueFrom } from 'rxjs';
import { Public } from './decorators/public.decorator';
import { AUTH_SERVICE_GRPC } from './auth-grpc.constants';
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
    return firstValueFrom(this.authGrpc.register(req));
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    const req: LoginRequest = {
      email: dto.email,
      password: dto.password,
    };
    return firstValueFrom(this.authGrpc.login(req));
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    const req: RefreshTokenRequest = {
      refreshToken: dto.refreshToken,
    };
    return firstValueFrom(this.authGrpc.refreshToken(req));
  }
}
