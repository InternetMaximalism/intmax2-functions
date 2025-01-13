import {
  type ContractCallOptions,
  type ContractCallParameters,
  L1ScrollMessengerAbi,
  type RetryOptions,
  TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE,
  calculateGasMultiplier,
  calculateIncreasedGasFees,
  config,
  executeTransaction,
  getMaxGasMultiplier,
  getNonce,
  getWalletClient,
  logger,
  replacedTransaction,
  waitForTransactionConfirmation,
} from "@intmax2-functions/shared";
import type { Abi, PublicClient } from "viem";
import {
  INCREMENT_RATE,
  RELAY_MESSAGE_ALREADY_EXECUTED,
  TRANSACTION_MAX_RETRIES,
  WITHDRAWAL_WAIT_TRANSACTION_TIMEOUT,
} from "../constants";
import type { ScrollMessengerResult } from "../types";

export const relayMessageWithProof = async (
  ethereumClient: PublicClient,
  claimableRequest: ScrollMessengerResult,
) => {
  const walletClientData = getWalletClient("withdrawal", "ethereum");

  const retryOptions: RetryOptions = {
    nonce: null,
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
  };

  const input = formatInput(claimableRequest);

  for (let attempt = 0; attempt < TRANSACTION_MAX_RETRIES; attempt++) {
    try {
      const { transactionHash } = await submitMessageToScroll(
        ethereumClient,
        walletClientData,
        L1ScrollMessengerAbi as Abi,
        input,
        retryOptions,
        attempt,
      );

      const transaction = await waitForTransactionConfirmation(
        ethereumClient,
        transactionHash,
        "relayMessageWithProof",
        {
          timeout: WITHDRAWAL_WAIT_TRANSACTION_TIMEOUT,
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

      if (attempt === TRANSACTION_MAX_RETRIES - 1) {
        throw new Error("Transaction Max retries reached");
      }

      if (message.includes(TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE)) {
        logger.warn(`Attempt ${attempt + 1} failed. Retrying with higher gas...`);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unexpected end of transaction");
};

export const submitMessageToScroll = async (
  ethereumClient: PublicClient,
  walletClientData: ReturnType<typeof getWalletClient>,
  abi: Abi,
  input: ReturnType<typeof formatInput>,
  retryOptions: RetryOptions,
  attempt: number,
) => {
  const contractAddress = (
    config.STAKING_RELAYER_ENABLED
      ? config.MINTER_CONTRACT_ADDRESS
      : config.L1_SCROLL_MESSENGER_CONTRACT_ADDRESS
  ) as `0x${string}`;

  const contractCallParams: ContractCallParameters = {
    contractAddress,
    abi,
    functionName: "relayMessageWithProof",
    account: walletClientData.account,
    args: input,
  };

  const multiplier = calculateGasMultiplier(attempt, INCREMENT_RATE);

  const [{ pendingNonce, currentNonce }, gasPriceData] = await Promise.all([
    getNonce(ethereumClient, walletClientData.account.address),
    getMaxGasMultiplier(ethereumClient, multiplier),
  ]);

  let { maxFeePerGas, maxPriorityFeePerGas } = gasPriceData;

  if (retryOptions.maxFeePerGas && retryOptions.maxPriorityFeePerGas) {
    const { newMaxFeePerGas, newMaxPriorityFeePerGas } = calculateIncreasedGasFees(
      retryOptions.maxFeePerGas,
      retryOptions.maxPriorityFeePerGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    );

    maxFeePerGas = newMaxFeePerGas;
    maxPriorityFeePerGas = newMaxPriorityFeePerGas;

    logger.info(
      `Increased gas fees multiplier: ${multiplier} - MaxFee: ${maxFeePerGas}, MaxPriorityFee: ${maxPriorityFeePerGas}`,
    );
  }

  retryOptions.maxFeePerGas = maxFeePerGas;
  retryOptions.maxPriorityFeePerGas = maxPriorityFeePerGas;

  const contractCallOptions: ContractCallOptions = {
    nonce: currentNonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };

  if (pendingNonce > currentNonce) {
    return await replacedTransaction({
      ethereumClient,
      walletClientData,
      contractCallParams,
      contractCallOptions,
    });
  }

  const transactionResult = await executeTransaction({
    ethereumClient,
    walletClientData,
    contractCallParams,
    contractCallOptions,
  });

  return transactionResult;
};

const formatInput = ({ claim_info }: ScrollMessengerResult) => {
  const from = claim_info.from;
  const to = claim_info.to;
  const value = BigInt(claim_info.value);
  const nonce = claim_info.nonce;
  const message = claim_info.message;

  const batchIndex = claim_info.proof.batch_index;
  const merkleProof = claim_info.proof.merkle_proof;

  const proof = {
    batchIndex,
    merkleProof,
  };

  return [from, to, value, nonce, message, proof];
};
