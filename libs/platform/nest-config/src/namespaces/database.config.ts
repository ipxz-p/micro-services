import { registerAs } from '@nestjs/config';

export const userDatabaseConfig = registerAs('userDatabase', () => ({
  url: process.env.USER_SERVICE_DATABASE_URL as string,
}));

export type UserDatabaseConfig = ReturnType<typeof userDatabaseConfig>;

export const notificationDatabaseConfig = registerAs(
  'notificationDatabase',
  () => ({
    url: process.env.NOTIFICATION_SERVICE_DATABASE_URL as string,
  }),
);

export type NotificationDatabaseConfig = ReturnType<
  typeof notificationDatabaseConfig
>;
