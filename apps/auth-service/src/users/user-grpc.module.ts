import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { USER_SERVICE_GRPC, createGrpcClients } from '@micro-service/nest-grpc';

// block registerAsync ที่เคย copy ไว้ 3 ที่ ตอนนี้เหลือแค่ definition สั้น ๆ
@Module({
  imports: [
    ClientsModule.registerAsync(
      createGrpcClients(__dirname, [
        {
          token: USER_SERVICE_GRPC,
          packageName: 'user.v1',
          protoPath: 'user/v1/user.proto',
          urlConfigKey: 'userServiceUrl',
        },
      ]),
    ),
  ],
  exports: [ClientsModule],
})
export class UserGrpcModule {}
