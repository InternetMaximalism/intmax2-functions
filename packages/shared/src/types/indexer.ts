import type { Address } from "./utils";

export type IndexerInfo = {
  address: Address;
  url: string;
  lastSyncedTime: Date;
  metadata: Record<string, unknown>;
};

export type IndexerInfoData = Omit<IndexerInfo, "address">;

export interface IndexerFilter {
  lastSyncedTime?: Date;
}
