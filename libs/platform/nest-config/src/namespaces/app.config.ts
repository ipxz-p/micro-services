import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  isProduction: process.env.NODE_ENV === 'production',
}));

export type AppConfig = ReturnType<typeof appConfig>;
