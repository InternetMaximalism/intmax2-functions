import {
  Discord,
  createNetworkClient,
  getMockWalletClient,
  getWalletClient,
} from "@intmax2-functions/shared";
import { type WalletClient, mockWalletTypes, walletTypes } from "../type";
import { getBalance } from "./observer.service";

export const performJob = async () => {
  const walletClients: WalletClient[] = walletTypes
    .map((type) => {
      return type.types.map((networkType) => ({
        type: type.name,
        ethereumClient: createNetworkClient(networkType),
        walletClientData: getWalletClient(type.name, networkType),
      }));
    })
    .flat();

  const mockWalletClients = mockWalletTypes
    .map((type) => {
      return type.types.map((networkType) => ({
        type: type.name,
        ethereumClient: createNetworkClient(networkType),
        walletClientData: getMockWalletClient(type.name, networkType),
      }));
    })
    .flat();

  const messages = await Promise.all([...walletClients, ...mockWalletClients].map(getBalance));

  if (messages.length !== 0) {
    const discord = Discord.getInstance();
    await discord.sendMessageWitForReady("INFO", messages.join("").replaceAll(",", ""));
  }
};
