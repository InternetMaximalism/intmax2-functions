import {
  type ContractCallOptionsEthers,
  type ContractCallParameters,
  ETHERS_CONFIRMATIONS,
  ETHERS_WAIT_TRANSACTION_TIMEOUT_MESSAGE,
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS,
  MockL1ScrollMessengerAbi,
  MockL1ScrollMessenger__factory,
  type RetryOptions,
  type SentMessageEventLog,
  TRANSACTION_ALREADY_EXECUTED,
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
  getEthersMaxGasMultiplier,
  getEthersTxOptions,
  getMockWalletClient,
  getNonce,
  logger,
  replacedEthersTransaction,
} from "@intmax2-function/shared";
import { ethers } from "ethers";
import { type Abi, type PublicClient, toHex } from "viem";

export const relayMessageWithProof = async (
  ethereumClient: PublicClient,
  sendMessage: SentMessageEventLog,
) => {
  const walletClientData = getMockWalletClient("mockMessenger", "ethereum");

  const retryOptions: RetryOptions = {
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
  };

  const input = formatInput(sendMessage);

  for (let attempt = 0; attempt < TRANSACTION_MAX_RETRIES; attempt++) {
    try {
      const multiplier = calculateGasMultiplier(attempt);

      const { transactionHash } = await submitMessageToScroll(
        ethereumClient,
        walletClientData,
        MockL1ScrollMessengerAbi as Abi,
        input,
        multiplier,
        retryOptions,
      );

      const receipt = await ethersWaitForTransactionConfirmation(
        ethereumClient,
        transactionHash,
        "withdraw",
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
  walletClientData: ReturnType<typeof getMockWalletClient>,
  abi: Abi,
  input: ReturnType<typeof formatInput>,
  multiplier: number,
  retryOptions: RetryOptions,
) => {
  const contractCallParams: ContractCallParameters = {
    contractAddress: MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS,
    abi,
    functionName: "relayMessageWithProof",
    account: walletClientData.account,
    args: input,
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
  const signer = new ethers.Wallet(config.MOCK_MESSENGER_PRIVATE_KEY, provider);
  toHex;
  const contract = MockL1ScrollMessenger__factory.connect(
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

const formatInput = ({ sender, target, value, messageNonce, message }: SentMessageEventLog) => {
  const from = sender;
  const to = target;
  const nonce = messageNonce;

  const proof = {
    batchIndex: 0n,
    merkleProof: "0x",
  };

  return [from, to, value, nonce, message, proof];
};
