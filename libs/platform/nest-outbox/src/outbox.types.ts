export const OUTBOX_STORE = Symbol('OUTBOX_STORE');

export type OutboxRecord = {
  id: string;
  topic: string;
  partitionKey: string;
  payload: unknown;
};

export interface OutboxStore {
  claimUnpublished(limit: number): Promise<OutboxRecord[]>;
  markPublished(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}
