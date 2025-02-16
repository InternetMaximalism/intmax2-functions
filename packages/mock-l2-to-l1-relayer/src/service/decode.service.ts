import {
  type BatchedCalldata,
  LiquidityAbi,
  type SentMessageEventLog,
} from "@intmax2-functions/shared";
import { decodeFunctionData, encodeFunctionData, prepareEncodeFunctionData } from "viem";
import { MAX_BATCH_SIZE } from "../constants";

export const generateCalldata = async (sentMessage: SentMessageEventLog) => {
  const { withdrawals, claimables } = decodeL2SentMessage(sentMessage);

  if (!withdrawals.length && !claimables.length) {
    return [];
  }

  const functionData = prepareEncodeFunctionData({
    abi: LiquidityAbi,
    functionName: "processWithdrawals",
  });

  const batchedCalldata: BatchedCalldata[] = [];
  const maxLength = Math.max(withdrawals.length, claimables.length);
  const numBatches = Math.ceil(maxLength / MAX_BATCH_SIZE);
  const optimalBatchSize = Math.ceil(maxLength / numBatches);

  for (let i = 0; i < maxLength; i += optimalBatchSize) {
    const batchWithdrawals = withdrawals.slice(i, i + optimalBatchSize);
    const batchClaimable = claimables.slice(i, i + optimalBatchSize);

    const encodedCalldata = encodeFunctionData({
      ...functionData,
      args: [batchWithdrawals, batchClaimable],
    });

    batchedCalldata.push({ encodedCalldata });
  }

  return batchedCalldata;
};

export const decodeL2SentMessage = (sentMessage: SentMessageEventLog) => {
  const { args } = decodeFunctionData({
    abi: LiquidityAbi,
    data: sentMessage.message as `0x${string}`,
  });

  if (!args || args.length < 2) {
    throw new Error("Invalid message format: Missing required arguments");
  }

  const [withdrawals, claimables] = args as [string[], string[]];

  return { withdrawals, claimables };
};
