import { status } from '@grpc/grpc-js';
import type { Metadata } from '@grpc/grpc-js';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { REQUIRE_IDENTITY_KEY } from '../decorators/require-identity.decorator';
import { parseIdentity } from '../grpc-identity';

@Injectable()
export class RequireIdentityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'rpc') {
      return true;
    }

    const requireIdentity = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_IDENTITY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireIdentity) {
      return true;
    }

    const metadata = context.switchToRpc().getContext<Metadata>();
    const identity = parseIdentity(metadata);

    if (!identity?.userId) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Missing identity context',
      });
    }

    return true;
  }
}
