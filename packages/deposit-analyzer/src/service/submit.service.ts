import {
  type ContractCallOptionsEthers,
  type ContractCallParameters,
  LiquidityAbi,
  Liquidity__factory,
  type RetryOptions,
  TRANSACTION_REPLACEMENT_FEE_TOO_LOW,
  TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE,
  WAIT_TRANSACTION_TIMEOUT,
  calculateGasMultiplier,
  calculateIncreasedGasFees,
  executeEthersTransaction,
  getEthersMaxGasMultiplier,
  getEthersTxOptions,
  getNonce,
  getWalletClient,
  logger,
  replacedEthersTransaction,
  waitForTransactionConfirmation,
} from "@intmax2-functions/shared";
import { ethers } from "ethers";
import { type Abi, type PublicClient, parseEther, toHex } from "viem";
import {
  FIXED_DEPOSIT_VALUE,
  LIQUIDITY_CONTRACT_ADDRESS,
  TRANSACTION_MAX_RETRIES,
} from "../constants";
import type { DepositAnalysisSummary } from "../types";

export const submitAnalyzeAndRelayDeposits = async (
  ethereumClient: PublicClient,
  depositSummary: DepositAnalysisSummary,
) => {
  logger.info(
    `Submitting analyzeAndRelayDeposits upToDepositId: ${depositSummary.upToDepositId} rejectDepositIds: ${depositSummary.rejectDepositIds} numDepositsToRelay: ${depositSummary.numDepositsToRelay} gasLimit: ${depositSummary.gasLimit}`,
  );

  const retryOptions: RetryOptions = {
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
  };

  for (let attempt = 0; attempt < TRANSACTION_MAX_RETRIES; attempt++) {
    try {
      const multiplier = calculateGasMultiplier(attempt);

      const { transactionHash } = await submitAnalyzeAndRelayDepositsWithRetry(
        ethereumClient,
        depositSummary,
        multiplier,
        retryOptions,
      );

      const transaction = await waitForTransactionConfirmation(
        ethereumClient,
        transactionHash,
        "analyzeAndRelayDeposits",
        {
          timeout: WAIT_TRANSACTION_TIMEOUT,
        },
      );

      return transaction;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.warn(`Error sending transaction: ${message}`);

      if (attempt === TRANSACTION_MAX_RETRIES - 1) {
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

export const submitAnalyzeAndRelayDepositsWithRetry = async (
  ethereumClient: PublicClient,
  depositSummary: DepositAnalysisSummary,
  multiplier: number,
  retryOptions: RetryOptions,
) => {
  const walletClientData = getWalletClient("depositAnalyzer", "ethereum");

  const contractCallParams: ContractCallParameters = {
    contractAddress: LIQUIDITY_CONTRACT_ADDRESS,
    abi: LiquidityAbi as Abi,
    functionName: "analyzeAndRelayDeposits",
    account: walletClientData.account,
    args: [depositSummary.upToDepositId, depositSummary.rejectDepositIds, depositSummary.gasLimit],
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
    value: parseEther(FIXED_DEPOSIT_VALUE),
    maxFeePerGas,
    maxPriorityFeePerGas,
  };

  const provider = new ethers.JsonRpcProvider(ethereumClient.transport.url);
  const signer = new ethers.Wallet(
    toHex(walletClientData.account.getHdKey().privateKey!),
    provider,
  );
  const contract = Liquidity__factory.connect(contractCallParams.contractAddress, signer);
  const ethersTxOptions = getEthersTxOptions(contractCallParams, contractCallOptions ?? {});
  const callArgs = [
    contractCallParams.args[0],
    contractCallParams.args[1],
    contractCallParams.args[2],
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
