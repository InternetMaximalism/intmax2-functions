import { formatEther, parseEther } from "viem";
import { REQUIRED_ETH } from "../constants";
import type { WalletClient } from "../type";

export const getBalance = async ({ type, ethereumClient, walletClientData }: WalletClient) => {
  const address = walletClientData.account.address;
  const chain = walletClientData.walletClient.chain?.name!;

  const balance = await ethereumClient.getBalance({
    address,
  });
  const balanceAsEther = formatEther(balance);
  const isSufficient = balance > parseEther(REQUIRED_ETH);

  return `
  Name: ${type}
  Address:  ${address}
  Chain: ${chain}
  Balance:  ${balanceAsEther} ETH
  Sufficient: ${isSufficient ? "Yes" : "No"}\n`;
};
