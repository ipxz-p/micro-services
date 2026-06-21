import type { CreateUserRequest } from '@micro-service/proto-contracts';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto implements CreateUserRequest {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
