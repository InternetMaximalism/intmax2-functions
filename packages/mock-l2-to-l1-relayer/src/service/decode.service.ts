import {
  type BatchedCalldata,
  LiquidityAbi,
  type SentMessageEventLog,
} from "@intmax2-functions/shared";
import { decodeFunctionData, encodeFunctionData, prepareEncodeFunctionData } from "viem";
import { MAX_RELAYER_BATCH_SIZE } from "../constants";

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

  const allItems = [
    ...withdrawals.map((item) => ({ type: "withdrawal", data: item })),
    ...claimables.map((item) => ({ type: "claimable", data: item })),
  ];

  for (let i = 0; i < allItems.length; i += MAX_RELAYER_BATCH_SIZE) {
    const batchItems = allItems.slice(i, i + MAX_RELAYER_BATCH_SIZE);
    const batchWithdrawals = batchItems
      .filter((item) => item.type === "withdrawal")
      .map((item) => item.data);
    const batchClaimables = batchItems
      .filter((item) => item.type === "claimable")
      .map((item) => item.data);

    const encodedCalldata = encodeFunctionData({
      ...functionData,
      args: [batchWithdrawals, batchClaimables],
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
