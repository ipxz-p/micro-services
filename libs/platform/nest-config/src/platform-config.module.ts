import { DynamicModule, Module } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { z } from 'zod';

export type PlatformConfigOptions = {
  serviceName: string;
  load: ConfigFactory[];
  envShape: z.ZodRawShape;
};

@Module({})
export class PlatformConfigModule {
  static forService(options: PlatformConfigOptions): DynamicModule {
    const schema = z.object(options.envShape);

    return {
      module: PlatformConfigModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: options.load,
          validate: (raw) => {
            const result = schema.safeParse(raw);

            if (!result.success) {
              const details = result.error.issues
                .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
                .join('\n');
              throw new Error(
                `[${options.serviceName}] environment is not valid:\n${details}`,
              );
            }

            return { ...raw, ...result.data };
          },
        }),
      ],
      exports: [ConfigModule],
    };
  }
}
