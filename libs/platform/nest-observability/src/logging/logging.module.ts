import { randomUUID } from 'crypto';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCorrelationId } from '@micro-service/nest-grpc';
import { HTTP_HEADER_CORRELATION_ID } from '@micro-service/service-identity';
import { LoggerModule } from 'nestjs-pino';

export type LoggingOptions = {
  serviceName: string;
};

@Module({})
export class LoggingModule {
  static forService(options: LoggingOptions): DynamicModule {
    return {
      module: LoggingModule,
      imports: [
        LoggerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const isProduction =
              config.get<string>('app.nodeEnv') === 'production';

            return {
              pinoHttp: {
                name: options.serviceName,
                level: config.get<string>('app.logLevel') ?? 'info',
                transport: isProduction
                  ? undefined
                  : { target: 'pino-pretty', options: { singleLine: true } },
                base: { service: options.serviceName },
                mixin: () => {
                  const correlationId = getCorrelationId();
                  return correlationId ? { correlationId } : {};
                },
                genReqId: (req, res) => {
                  const incoming = req.headers?.[HTTP_HEADER_CORRELATION_ID];
                  const id =
                    typeof incoming === 'string' && incoming.trim()
                      ? incoming.trim()
                      : randomUUID();
                  res.setHeader(HTTP_HEADER_CORRELATION_ID, id);
                  return id;
                },
                redact: {
                  paths: [
                    'req.headers.authorization',
                    'req.headers.cookie',
                    '*.password',
                    '*.passwordHash',
                    '*.accessToken',
                    '*.refreshToken',
                  ],
                  censor: '[redacted]',
                },
              },
            };
          },
        }),
      ],
      exports: [LoggerModule],
    };
  }
}
