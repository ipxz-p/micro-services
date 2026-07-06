import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthJwtModule } from '../auth/auth-jwt.module';
import { AuthGatewayModule } from '../auth/auth.gateway.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CorrelationIdMiddleware } from '../common/correlation-id.middleware';
import { GrpcMetadataInterceptor } from '../common/interceptors/grpc-metadata.interceptor';
import { UsersGatewayModule } from '../users/users.gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthJwtModule,
    AuthGatewayModule,
    UsersGatewayModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcMetadataInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
