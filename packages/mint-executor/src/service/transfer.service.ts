import {
  type ContractCallOptionsEthers,
  type ContractCallParameters,
  ETHERS_CONFIRMATIONS,
  ETHERS_WAIT_TRANSACTION_TIMEOUT_MESSAGE,
  MINTER_CONTRACT_ADDRESS,
  MinterAbi,
  Minter__factory,
  type RetryOptions,
  TRANSACTION_INCREMENT_RATE,
  TRANSACTION_MISSING_REVERT_DATA,
  TRANSACTION_REPLACEMENT_FEE_TOO_LOW,
  TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE,
  TRANSACTION_WAIT_TRANSACTION_TIMEOUT,
  calculateGasMultiplier,
  calculateIncreasedGasFees,
  ethersWaitForTransactionConfirmation,
  executeEthersTransaction,
  getEthersMaxGasMultiplier,
  getEthersTxOptions,
  getNonce,
  getWalletClient,
  logger,
  replacedEthersTransaction,
} from "@intmax2-function/shared";
import { ethers } from "ethers";
import { type Abi, type PublicClient, toHex } from "viem";

const TRANSACTION_MAX_RETRIES = 1;

export const transferToLiquidity = async (ethereumClient: PublicClient, amount: bigint) => {
  const retryOptions: RetryOptions = {
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
  };

  for (let attempt = 0; attempt < TRANSACTION_MAX_RETRIES; attempt++) {
    try {
      const multiplier = calculateGasMultiplier(attempt, TRANSACTION_INCREMENT_RATE);

      const { transactionHash } = await submitMintWithRetry(
        ethereumClient,
        amount,
        multiplier,
        retryOptions,
      );

      const receipt = await ethersWaitForTransactionConfirmation(
        ethereumClient,
        transactionHash,
        "transferToLiquidity",
        {
          confirms: ETHERS_CONFIRMATIONS,
          timeout: TRANSACTION_WAIT_TRANSACTION_TIMEOUT,
        },
      );

      return receipt;
    } catch (error) {
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

export const submitMintWithRetry = async (
  ethereumClient: PublicClient,
  amount: bigint,
  multiplier: number,
  retryOptions: RetryOptions,
) => {
  const walletClientData = getWalletClient("tokenManager", "ethereum");

  const contractCallParams: ContractCallParameters = {
    contractAddress: MINTER_CONTRACT_ADDRESS,
    abi: MinterAbi as Abi,
    functionName: "transferToLiquidity",
    account: walletClientData.account,
    args: [amount],
  };

  const [{ pendingNonce, currentNonce }, gasPriceData] = await Promise.all([
    getNonce(ethereumClient, walletClientData.account.address),
    getEthersMaxGasMultiplier(ethereumClient, multiplier),
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
  };

  const provider = new ethers.JsonRpcProvider(ethereumClient.transport.url);
  const signer = new ethers.Wallet(
    toHex(walletClientData.account.getHdKey().privateKey!),
    provider,
  );
  const contract = Minter__factory.connect(contractCallParams.contractAddress, signer);
  const ethersTxOptions = getEthersTxOptions(contractCallParams, contractCallOptions ?? {});
  const callArgs = [contractCallParams.args[0], ethersTxOptions];

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
