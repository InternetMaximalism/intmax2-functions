import {
  type ContractCallOptionsEthers,
  type ContractCallParameters,
  ETHERS_CONFIRMATIONS,
  ETHERS_WAIT_TRANSACTION_TIMEOUT_MESSAGE,
  IL1ScrollMessenger__factory,
  L1ScrollMessengerAbi,
  type RetryOptions,
  TRANSACTION_ALREADY_EXECUTED,
  TRANSACTION_INCREMENT_RATE,
  TRANSACTION_MAX_RETRIES,
  TRANSACTION_MISSING_REVERT_DATA,
  TRANSACTION_REPLACEMENT_FEE_TOO_LOW,
  TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE,
  TRANSACTION_WAIT_TRANSACTION_TIMEOUT,
  calculateGasMultiplier,
  calculateIncreasedGasFees,
  config,
  ethersWaitForTransactionConfirmation,
  executeEthersTransaction,
  getEthersTxOptions,
  getMaxGasMultiplier,
  getNonce,
  getWalletClient,
  logger,
  replacedEthersTransaction,
} from "@intmax2-function/shared";
import { ethers } from "ethers";
import { type Abi, type PublicClient, toHex } from "viem";
import { RELAYER_FIXED_GAS_LIMIT } from "../constants";
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

      const receipt = await ethersWaitForTransactionConfirmation(
        ethereumClient,
        transactionHash,
        "relayMessageWithProof",
        {
          confirms: ETHERS_CONFIRMATIONS,
          timeout: TRANSACTION_WAIT_TRANSACTION_TIMEOUT,
        },
      );

      return receipt;
    } catch (error) {
      if (error instanceof Error && error.message.includes(TRANSACTION_ALREADY_EXECUTED)) {
        logger.warn("Relay message already executed. Skipping.");
        return;
      }

      const message = error instanceof Error ? error.message : "Unknown error";
      logger.warn(`Error sending transaction: ${message}`);

      if (attempt === TRANSACTION_MAX_RETRIES - 1) {
        throw new Error("Transaction Max retries reached");
      }

      if (
        message.includes(TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE) ||
        message.includes(TRANSACTION_REPLACEMENT_FEE_TOO_LOW) ||
        message.includes(TRANSACTION_MISSING_REVERT_DATA) ||
        message.includes(ETHERS_WAIT_TRANSACTION_TIMEOUT_MESSAGE)
      ) {
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
  const contractCallParams: ContractCallParameters = {
    contractAddress: config.L1_SCROLL_MESSENGER_CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: "relayMessageWithProof",
    account: walletClientData.account,
    args: input,
  };

  const multiplier = calculateGasMultiplier(attempt, TRANSACTION_INCREMENT_RATE);

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

  const contractCallOptions: ContractCallOptionsEthers = {
    nonce: currentNonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit: RELAYER_FIXED_GAS_LIMIT,
  };

  const provider = new ethers.JsonRpcProvider(ethereumClient.transport.url);
  const signer = new ethers.Wallet(
    toHex(walletClientData.account.getHdKey().privateKey!),
    provider,
  );
  const contract = IL1ScrollMessenger__factory.connect(contractCallParams.contractAddress, signer);
  const ethersTxOptions = getEthersTxOptions(contractCallParams, contractCallOptions ?? {});
  const callArgs = [
    contractCallParams.args[0],
    contractCallParams.args[1],
    contractCallParams.args[2],
    contractCallParams.args[3],
    contractCallParams.args[4],
    contractCallParams.args[5],
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

const formatInput = ({
  claim_info: {
    from,
    to,
    value,
    nonce,
    message,
    proof: { batch_index: batchIndex, merkle_proof: merkleProof },
  },
}: ScrollMessengerResult) => {
  return [from, to, BigInt(value), nonce, message, { batchIndex, merkleProof }];
};
