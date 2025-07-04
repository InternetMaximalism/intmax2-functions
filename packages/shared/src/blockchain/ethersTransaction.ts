import { JsonRpcProvider } from "ethers";
import type { PublicClient } from "viem";
import { logger } from "../lib/logger";
import type { ContractCallOptionsEthers, ContractCallParameters } from "../types";

interface EthersTransactionExecutionParams {
  functionName: string;
  contract: any;
  callArgs: any;
}

export const getEthersTxOptions = (
  contractCallParams: ContractCallParameters,
  contractCallOptions: ContractCallOptionsEthers,
) => {
  const { functionName, args } = contractCallParams;
  const { nonce, gasPrice, maxFeePerGas, maxPriorityFeePerGas, gasLimit, value } =
    contractCallOptions ?? {};

  if (gasPrice) {
    logger.info(
      `functionName: ${functionName}, args: ${args}, nonce: ${nonce}, gasPrice: ${gasPrice?.toString()}`,
    );

    return {
      nonce,
      gasPrice,
      type: 0,
      ...(gasLimit ? { gasLimit } : {}),
    };
  }

  logger.info(
    `functionName: ${functionName}, args: ${args}, nonce: ${nonce}, maxFeePerGas: ${maxFeePerGas?.toString()} maxPriorityFeePerGas: ${maxPriorityFeePerGas?.toString()}`,
  );

  return {
    nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    ...(value ? { value } : {}),
    ...(gasLimit ? { gasLimit } : {}),
  };
};

export const executeEthersTransaction = async ({
  functionName,
  contract,
  callArgs,
}: EthersTransactionExecutionParams) => {
  try {
    if (typeof contract[functionName] !== "function") {
      throw new Error(`Method ${functionName} does not exist on contract`);
    }

    const tx = await contract[functionName](...callArgs);

    const transactionHash = tx.hash as `0x${string}`;
    logger.info(`${functionName} transaction initiated with hash: ${transactionHash}`);

    return {
      transactionHash,
      nonce: tx.nonce,
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Transaction failed: ${error.message}`);
      throw error;
    } else {
      console.error("An unknown error occurred");
      throw new Error("Unknown transaction error");
    }
  }
};

export const replacedEthersTransaction = async ({
  functionName,
  contract,
  callArgs,
}: EthersTransactionExecutionParams) => {
  logger.warn(`Transaction was replaced. Sending new transaction...`);

  try {
    const transactionResult = await executeEthersTransaction({
      functionName,
      contract,
      callArgs,
    });

    return transactionResult;
  } catch (error) {
    logger.warn(
      `Failed to send replaced transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    );

    throw error;
  }
};

interface WaitForTransactionOptions {
  confirms?: number;
  timeout?: number;
}

const DEFAULT_OPTIONS: Required<WaitForTransactionOptions> = {
  confirms: 1,
  timeout: 30_000,
};

export const ethersWaitForTransactionConfirmation = async (
  ethereumClient: PublicClient,
  transactionHash: string,
  functionName: string,
  options?: WaitForTransactionOptions,
) => {
  try {
    const { confirms, timeout } = options ?? DEFAULT_OPTIONS;
    const provider = new JsonRpcProvider(ethereumClient.transport.url);
    const receipt = await provider.waitForTransaction(transactionHash, confirms, timeout);

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    if (receipt.status !== 1) {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
    }

    logger.info(`${functionName} transaction confirmed`);

    return receipt;
  } catch (error) {
    logger.warn(
      `Failed to confirm ${functionName} transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    );

    throw error;
  }
};
