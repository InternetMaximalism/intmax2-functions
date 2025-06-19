import type { Address } from "./utils";

export type IndexerInfo = {
  address: Address;
  url: string;
  active?: boolean;
  lastSyncedTime: Date;
  metadata: Record<string, unknown>;
};

export type IndexerInfoData = Omit<IndexerInfo, "address">;

export interface IndexerFilter {
  addresses?: Address[];
  lastSyncedTime?: Date;
}
