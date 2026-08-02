import { z } from 'zod';
import {
  KAFKA_HEADER_CORRELATION_ID,
  KAFKA_HEADER_EVENT_ID,
  KAFKA_HEADER_EVENT_TYPE,
} from './headers';

export type DomainEvent<TType extends string, TPayload> = {
  eventId: string;
  eventType: TType;
  occurredAt: string;
  correlationId?: string;
} & TPayload;

export const envelopeShape = {
  eventId: z.string().min(1),
  occurredAt: z.iso.datetime(),
  correlationId: z.string().min(1).optional(),
};

export function defineEvent<
  TType extends string,
  TShape extends z.ZodRawShape,
>(eventType: TType, payload: TShape) {
  return z.object({
    ...envelopeShape,
    eventType: z.literal(eventType),
    ...payload,
  });
}

export function buildKafkaMessageHeaders(event: {
  eventId: string;
  eventType: string;
  correlationId?: string;
}): Record<string, string> {
  return {
    [KAFKA_HEADER_EVENT_TYPE]: event.eventType,
    [KAFKA_HEADER_EVENT_ID]: event.eventId,
    ...(event.correlationId
      ? { [KAFKA_HEADER_CORRELATION_ID]: event.correlationId }
      : {}),
  };
}
