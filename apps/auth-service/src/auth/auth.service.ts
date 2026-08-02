import { status } from '@grpc/grpc-js';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from '@micro-service/proto-contracts/auth/v1/auth';
import {
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@micro-service/proto-contracts/user/v1/user';
import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { hash } from 'bcryptjs';
import { firstValueFrom } from 'rxjs';
import { USER_SERVICE_GRPC, callGrpc } from '@micro-service/nest-grpc';
import type { JwtTokenPayload } from '@micro-service/service-identity';

@Injectable()
export class AuthService implements OnModuleInit {
  private userGrpc!: UserServiceClient;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(
    @Inject(USER_SERVICE_GRPC) private readonly client: ClientGrpc,
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.accessExpiresIn = config.getOrThrow<string>('jwt.accessExpiresIn');
    this.refreshExpiresIn = config.getOrThrow<string>('jwt.refreshExpiresIn');
  }

  onModuleInit() {
    this.userGrpc = this.client.getService<UserServiceClient>(
      USER_SERVICE_NAME,
    );
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const existing = await firstValueFrom(
      this.userGrpc.getUserByEmail({ email: request.email }),
    );

    if (existing.found) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'User already exists',
      });
    }

    const passwordHash = await hash(request.password, 12);
    const created = await callGrpc((metadata) =>
      this.userGrpc.createUser(
        {
          email: request.email,
          passwordHash,
        },
        metadata,
      ),
    );

    const tokens = await this.issueTokens(created.id, created.email);

    return {
      ...tokens,
      user: { id: created.id, email: created.email },
    };
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    const result = await firstValueFrom(
      this.userGrpc.verifyCredentials({
        email: request.email,
        password: request.password,
      }),
    );

    if (!result.valid || !result.id) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(result.id, result.email);

    return {
      ...tokens,
      user: { id: result.id, email: result.email },
    };
  }

  async refreshToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    const payload = await this.verifyRefreshToken(request.refreshToken);
    return this.issueTokens(payload.sub, payload.email);
  }

  private async issueTokens(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(userId, email),
      this.signRefreshToken(userId, email),
    ]);

    return { accessToken, refreshToken };
  }

  private signAccessToken(userId: number, email: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, email, type: 'access' } satisfies JwtTokenPayload,
      { expiresIn: this.accessExpiresIn } as JwtSignOptions,
    );
  }

  private signRefreshToken(userId: number, email: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, email, type: 'refresh' } satisfies JwtTokenPayload,
      { expiresIn: this.refreshExpiresIn } as JwtSignOptions,
    );
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtTokenPayload>(
        refreshToken,
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
