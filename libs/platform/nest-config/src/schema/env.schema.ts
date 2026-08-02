import { z } from 'zod';

const port = z.coerce.number().int().min(1).max(65535);

export const appEnvShape = {
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
};

export const httpEnvShape = {
  API_GATEWAY_HTTP_PORT: port.default(3000),
};

export const grpcServerEnvShape = {
  USER_SERVICE_GRPC_PORT: port.default(50051),
  AUTH_SERVICE_GRPC_PORT: port.default(50052),
};

export const grpcClientEnvShape = {
  USER_SERVICE_GRPC_URL: z.string().min(1).default('127.0.0.1:50051'),
  AUTH_SERVICE_GRPC_URL: z.string().min(1).default('127.0.0.1:50052'),
};

export const healthEnvShape = {
  USER_SERVICE_HEALTH_PORT: port.default(3051),
  AUTH_SERVICE_HEALTH_PORT: port.default(3052),
  NOTIFICATION_SERVICE_HEALTH_PORT: port.default(3060),
};

export const jwtEnvShape = {
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('7d'),
};

export const kafkaEnvShape = {
  KAFKA_BROKERS: z.string().min(1),
};

export const userDbEnvShape = {
  USER_SERVICE_DATABASE_URL: z.string().min(1),
};

export const notificationDbEnvShape = {
  NOTIFICATION_SERVICE_DATABASE_URL: z.string().min(1),
};

export type EnvShape = z.ZodRawShape;
