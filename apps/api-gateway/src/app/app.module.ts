import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersGatewayModule } from '../users/users.gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
