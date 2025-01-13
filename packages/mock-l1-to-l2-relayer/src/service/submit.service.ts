import {
  type ContractCallOptionsEthers,
  type ContractCallParameters,
  type L1SentMessageEventLog,
  L2ScrollMessengerAbi,
  MockL2ScrollMessenger__factory,
  type RetryOptionsEthers,
  TRANSACTION_REPLACEMENT_FEE_TOO_LOW,
  TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE,
  WAIT_TRANSACTION_TIMEOUT,
  calculateEthersIncreasedGasPrice,
  calculateGasMultiplier,
  config,
  executeEthersTransaction,
  getEthersScrollMaxGasMultiplier,
  getEthersTxOptions,
  getMockWalletClient,
  getNonce,
  logger,
  replacedEthersTransaction,
  waitForTransactionConfirmation,
} from "@intmax2-functions/shared";
import { ethers } from "ethers";
import type { Abi, PublicClient } from "viem";
import {
  MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS,
  RELAY_MESSAGE_ALREADY_EXECUTED,
  SCROLL_TRANSACTION_MAX_RETRIES,
} from "../constants";

export const submitRelayMessagesToL2MockMessenger = async (
  ethereumClient: PublicClient,
  l1SentMessageEventLog: L1SentMessageEventLog,
) => {
  if (!validateL1SentMessageEvent(l1SentMessageEventLog)) {
    throw new Error(`Invalid l1SentMessageEvent`);
  }

  const retryOptions: RetryOptionsEthers = {
    gasPrice: null,
  };

  for (let attempt = 0; attempt < SCROLL_TRANSACTION_MAX_RETRIES; attempt++) {
    try {
      const multiplier = calculateGasMultiplier(attempt);

      const { transactionHash } = await submitRelayMessagesToL2MockMessengerWithRetry(
        ethereumClient,
        l1SentMessageEventLog,
        multiplier,
        retryOptions,
      );

      const transaction = await waitForTransactionConfirmation(
        ethereumClient,
        transactionHash,
        "relayMessage",
        {
          timeout: WAIT_TRANSACTION_TIMEOUT,
        },
      );

      return transaction;
    } catch (error) {
      if (error instanceof Error && error.message.includes(RELAY_MESSAGE_ALREADY_EXECUTED)) {
        logger.warn("Relay message already executed. Skipping.");
        return;
      }

      const message = error instanceof Error ? error.message : "Unknown error";
      logger.warn(`Error sending transaction: ${message}`);

      if (attempt === SCROLL_TRANSACTION_MAX_RETRIES - 1) {
        throw new Error("Transaction Max retries reached");
      }

      if (
        message.includes(TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE) ||
        message.includes(TRANSACTION_REPLACEMENT_FEE_TOO_LOW)
      ) {
        logger.warn(`Attempt ${attempt + 1} failed. Retrying with higher gas...`);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unexpected end of transaction");
};

export const submitRelayMessagesToL2MockMessengerWithRetry = async (
  ethereumClient: PublicClient,
  l1SentMessageEventLog: L1SentMessageEventLog,
  multiplier: number,
  retryOptions: RetryOptionsEthers,
) => {
  const walletClientData = getMockWalletClient("mockMessenger", "scroll");

  const contractCallParams: ContractCallParameters = {
    contractAddress: MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS,
    abi: L2ScrollMessengerAbi as Abi,
    functionName: "relayMessage",
    account: walletClientData.account,
    args: [
      l1SentMessageEventLog.sender,
      l1SentMessageEventLog.target,
      l1SentMessageEventLog.value,
      l1SentMessageEventLog.messageNonce,
      l1SentMessageEventLog.message,
    ],
  };

  const [{ pendingNonce, currentNonce }, gasPriceData] = await Promise.all([
    getNonce(ethereumClient, walletClientData.account.address),
    getEthersScrollMaxGasMultiplier(ethereumClient, multiplier),
  ]);
  let { gasPrice } = gasPriceData;

  if (retryOptions.gasPrice) {
    const { newGasPrice } = calculateEthersIncreasedGasPrice(retryOptions.gasPrice, gasPrice);

    gasPrice = newGasPrice;

    logger.info(`Increased gas fees multiplier: ${multiplier} - gasPrice: ${gasPrice}`);
  }

  retryOptions.gasPrice = gasPrice;

  const contractCallOptions: ContractCallOptionsEthers = {
    nonce: currentNonce,
    gasPrice,
  };

  const provider = new ethers.JsonRpcProvider(ethereumClient.transport.url);
  const signer = new ethers.Wallet(config.MOCK_MESSENGER_PRIVATE_KEY, provider);
  const contract = MockL2ScrollMessenger__factory.connect(
    contractCallParams.contractAddress,
    signer,
  );
  const ethersTxOptions = getEthersTxOptions(contractCallParams, contractCallOptions ?? {});
  const callArgs = [
    contractCallParams.args[0],
    contractCallParams.args[1],
    contractCallParams.args[2],
    contractCallParams.args[3],
    contractCallParams.args[4],
    ethersTxOptions,
  ];

  if (pendingNonce > currentNonce) {
    return await replacedEthersTransaction({
      functionName: contractCallParams.functionName,
      contract,
      callArgs,
    });
  }

  const transactionResult = await executeEthersTransaction({
    functionName: contractCallParams.functionName,
    contract,
    callArgs,
  });

  return transactionResult;
};

const validateL1SentMessageEvent = (l1SentMessageEventLog: L1SentMessageEventLog) => {
  return (
    typeof l1SentMessageEventLog.sender === "string" &&
    typeof l1SentMessageEventLog.target === "string" &&
    typeof l1SentMessageEventLog.value === "bigint" &&
    typeof l1SentMessageEventLog.messageNonce === "bigint" &&
    typeof l1SentMessageEventLog.message === "string"
  );
};
