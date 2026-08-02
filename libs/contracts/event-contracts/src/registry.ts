import type { z } from 'zod';
import { USER_TOPICS, userCreatedV1Schema } from './user';

// เก็บรวม schema ของ event ทั้งหมดที่ระบบใช้บน Kafka
export const EVENT_SCHEMA_REGISTRY = {
  [USER_TOPICS.CREATED_V1]: userCreatedV1Schema,
} as const satisfies Record<string, z.ZodType>;

export type KnownTopic = keyof typeof EVENT_SCHEMA_REGISTRY;

export function getEventSchema(topic: string): z.ZodType | undefined {
  return (EVENT_SCHEMA_REGISTRY as Record<string, z.ZodType>)[topic];
}
