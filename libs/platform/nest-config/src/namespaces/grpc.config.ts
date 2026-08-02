import { registerAs } from '@nestjs/config';

export const grpcConfig = registerAs('grpc', () => ({
  userServicePort: Number(process.env.USER_SERVICE_GRPC_PORT ?? 50051),
  authServicePort: Number(process.env.AUTH_SERVICE_GRPC_PORT ?? 50052),
  userServiceUrl: process.env.USER_SERVICE_GRPC_URL ?? '127.0.0.1:50051',
  authServiceUrl: process.env.AUTH_SERVICE_GRPC_URL ?? '127.0.0.1:50052',
}));

export type GrpcConfig = ReturnType<typeof grpcConfig>;
