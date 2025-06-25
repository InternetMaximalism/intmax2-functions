import { getMockWalletClient, getWalletClient } from "@intmax2-functions/shared";
import type { PublicClient } from "viem";

export const walletTypes: WalletType[] = [
  {
    name: "builder",
    types: ["scroll"],
  },
  {
    name: "depositAnalyzer",
    types: ["ethereum"],
  },
  {
    name: "withdrawal",
    types: ["scroll"],
  },
  {
    name: "blockBuilderReward",
    types: ["scroll"],
  },
  {
    name: "tokenManager",
    types: ["ethereum"],
  },
];

export const mockWalletTypes = [
  {
    name: "mockMessenger" as const,
    types: ["ethereum", "scroll"] as const,
  },
];

export type WalletType = {
  name: "builder" | "depositAnalyzer" | "withdrawal" | "blockBuilderReward" | "tokenManager";
  types: ("ethereum" | "scroll")[];
};

export type WalletClient = {
  ethereumClient: PublicClient;
  type: string;
  walletClientData: ReturnType<typeof getWalletClient> | ReturnType<typeof getMockWalletClient>;
};
