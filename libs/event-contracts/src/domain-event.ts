import {
  KAFKA_HEADER_CORRELATION_ID,
  KAFKA_HEADER_EVENT_ID,
  KAFKA_HEADER_EVENT_TYPE,
} from './headers';

export type DomainEvent = {
  eventId: string;
  eventType: string;
  correlationId?: string;
};

export function buildKafkaMessageHeaders(
  event: DomainEvent,
): Record<string, string> {
  return {
    [KAFKA_HEADER_EVENT_TYPE]: event.eventType,
    [KAFKA_HEADER_EVENT_ID]: event.eventId,
    ...(event.correlationId
      ? { [KAFKA_HEADER_CORRELATION_ID]: event.correlationId }
      : {}),
  };
}
