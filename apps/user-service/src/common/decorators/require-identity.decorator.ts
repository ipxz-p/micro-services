import { SetMetadata } from '@nestjs/common';

export const REQUIRE_IDENTITY_KEY = 'requireIdentity';
export const RequireIdentity = () => SetMetadata(REQUIRE_IDENTITY_KEY, true);
