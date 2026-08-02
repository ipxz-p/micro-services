import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ClientsModuleAsyncOptions, Transport } from '@nestjs/microservices';

export type GrpcClientDefinition = {
  token: string;
  packageName: string;
  protoPath: string;
  urlConfigKey: string;
};

export function createGrpcClients(
  baseDir: string,
  definitions: GrpcClientDefinition[],
): ClientsModuleAsyncOptions {
  return definitions.map((definition) => ({
    name: definition.token,
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      transport: Transport.GRPC as const,
      options: {
        package: definition.packageName,
        protoPath: join(baseDir, definition.protoPath),
        url: config.getOrThrow<string>(`grpc.${definition.urlConfigKey}`),
      },
    }),
  }));
}
