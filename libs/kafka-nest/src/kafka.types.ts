export type KafkaMessageContext = {
  topic: string;
  partition: number;
  offset: string;
  key: string | null;
  headers: Record<string, string>;
  value: string;
};

export type KafkaMessageHandler = (message: KafkaMessageContext) => Promise<void>;

export type KafkaProducerModuleOptions = {
  clientId: string;
};

export type KafkaConsumerModuleOptions = {
  clientId: string;
  groupId: string;
};
