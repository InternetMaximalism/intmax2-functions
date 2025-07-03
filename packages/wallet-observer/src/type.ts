import { getMockWalletClient, getWalletClient } from "@intmax2-function/shared";
import type { PublicClient } from "viem";

export const walletTypes: WalletType[] = [
  {
    name: "builder",
    types: ["scroll"],
    min: false,
  },
  {
    name: "depositAnalyzer",
    types: ["ethereum"],
    min: false,
  },
  {
    name: "withdrawal",
    types: ["scroll"],
    min: false,
  },
  {
    name: "blockBuilderReward",
    types: ["scroll"],
    min: true,
  },
  {
    name: "tokenManager",
    types: ["ethereum"],
    min: true,
  },
];

export const mockWalletTypes = [
  {
    name: "mockMessenger" as const,
    types: ["ethereum", "scroll"] as const,
    min: false,
  },
];

export type WalletType = {
  name: "builder" | "depositAnalyzer" | "withdrawal" | "blockBuilderReward" | "tokenManager";
  types: ("ethereum" | "scroll")[];
  min: boolean;
};

export type WalletClient = {
  ethereumClient: PublicClient;
  type: string;
  walletClientData: ReturnType<typeof getWalletClient> | ReturnType<typeof getMockWalletClient>;
  min: boolean;
};
