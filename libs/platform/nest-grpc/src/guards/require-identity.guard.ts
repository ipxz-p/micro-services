import { status } from '@grpc/grpc-js';
import type { Metadata } from '@grpc/grpc-js';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { parseIdentity } from '../metadata/grpc-metadata.util';
import { ALLOW_ANONYMOUS_KEY } from './allow-anonymous.decorator';

@Injectable()
export class RequireIdentityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'rpc') {
      return true;
    }

    const allowAnonymous = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ANONYMOUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (allowAnonymous) {
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
