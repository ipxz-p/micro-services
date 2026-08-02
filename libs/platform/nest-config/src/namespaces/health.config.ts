import { registerAs } from '@nestjs/config';

export const healthConfig = registerAs('health', () => ({
  userServicePort: Number(process.env.USER_SERVICE_HEALTH_PORT ?? 3051),
  authServicePort: Number(process.env.AUTH_SERVICE_HEALTH_PORT ?? 3052),
  notificationServicePort: Number(
    process.env.NOTIFICATION_SERVICE_HEALTH_PORT ?? 3060,
  ),
}));

export type HealthConfig = ReturnType<typeof healthConfig>;
