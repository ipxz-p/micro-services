import type {
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from '@micro-service/proto-contracts/auth/v1/auth';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto implements RegisterRequest {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class LoginDto implements LoginRequest {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDto implements RefreshTokenRequest {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
