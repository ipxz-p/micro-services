import { join } from 'path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

loadEnv({ path: join(__dirname, '../../.env') });

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: env('NOTIFICATION_SERVICE_DATABASE_URL'),
  },
});
