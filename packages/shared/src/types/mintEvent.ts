import { Timestamp } from "@google-cloud/firestore";

export type MintEventData = {
  id: string;
  type: MintEventType;
  blockNumber: number;
  transactionHash: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type MintEventInput = Omit<MintEventData, "id" | "createdAt" | "updatedAt">;
export type MintEventType = "mint" | "transferToLiquidity";
