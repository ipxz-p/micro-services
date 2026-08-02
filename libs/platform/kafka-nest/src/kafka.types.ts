/** envelope ขั้นต่ำที่ producer ต้องการเพื่อสร้าง Kafka header */
export type PublishableEvent = {
  eventId: string;
  eventType: string;
  correlationId?: string;
} & Record<string, unknown>;

/** metadata ของ message ดิบ (ไม่รวม payload ที่ validate แล้ว) */
export type KafkaMessageContext = {
  topic: string;
  partition: number;
  offset: string;
  key: string | null;
  headers: Record<string, string>;
};

export type KafkaMessageHandler<TEvent = unknown> = (
  event: TEvent,
  context: KafkaMessageContext,
) => Promise<void>;

export type KafkaProducerModuleOptions = {
  clientId: string;
};

export type KafkaConsumerModuleOptions = {
  clientId: string;
  groupId: string;
  /** จำนวนครั้งที่ retry ก่อนโยนเข้า DLQ (นับรวมครั้งแรก) */
  maxAttempts?: number;
  /** หน่วง backoff ตั้งต้น (ms) — เพิ่มแบบ exponential ต่อครั้ง */
  retryBackoffMs?: number;
};
