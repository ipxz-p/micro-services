import { USER_CREATED_V1_TOPIC } from '../topics';

export type UserCreatedV1Event = {
  eventId: string;
  eventType: typeof USER_CREATED_V1_TOPIC;
  occurredAt: string;
  userId: number;
  email: string;
  correlationId?: string;
};
