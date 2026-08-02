import { registerAs } from '@nestjs/config';

export const httpConfig = registerAs('http', () => ({
  gatewayPort: Number(process.env.API_GATEWAY_HTTP_PORT ?? 3000),
}));

export type HttpConfig = ReturnType<typeof httpConfig>;
