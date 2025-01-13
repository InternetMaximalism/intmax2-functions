import type { Address } from "./utils";

export type IndexerInfo = {
  address: Address;
  info: {
    url: string;
    speed: number;
    fee: number;
    active: boolean;
  };
};

export type IndexerInfoData = Omit<IndexerInfo, "address">;
