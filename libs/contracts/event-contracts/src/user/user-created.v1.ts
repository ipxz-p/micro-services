import { z } from 'zod';
import { defineEvent } from '../envelope/domain-event';
import { USER_TOPICS } from './topics';

export const userCreatedV1Schema = defineEvent(USER_TOPICS.CREATED_V1, {
  userId: z.number().int().positive(),
  email: z.email(),
});

export type UserCreatedV1Event = z.infer<typeof userCreatedV1Schema>;
