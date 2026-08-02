import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtTokenPayload } from '@micro-service/service-identity';

/** ดึง payload ที่ JwtAuthGuard แนบไว้ที่ request */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtTokenPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: JwtTokenPayload }>();
    return request.user;
  },
);
