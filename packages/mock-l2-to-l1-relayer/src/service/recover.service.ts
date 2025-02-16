import {
  type BatchedCalldata,
  LiquidityAbi,
  type SentMessageEventLog,
} from "@intmax2-functions/shared";
import type { PublicClient } from "viem";
import { encodeFunctionData, prepareEncodeFunctionData } from "viem";
import { MAX_BATCH_SIZE } from "../constants";
import { decodeL2SentMessage } from "./decode.service";
import { fetchPendingWithdrawalHashes } from "./event.service";
import { relayMessageWithProof } from "./submit.service";

/*
// NOTE: invoke this function in the main function
// await filterWithdrawalClaimableEvents(ethereumClient, sentMessages);
*/
export const filterWithdrawalClaimableEvents = async (
  ethereumClient: PublicClient,
  sentMessages: SentMessageEventLog[],
) => {
  const currentBlockNumber = await ethereumClient.getBlockNumber();
  const sentMessagesWithClaimables = [];
  const withdrawalHashes = [];
  for (const sentMessage of sentMessages) {
    const { claimables } = decodeL2SentMessage(sentMessage);
    if (claimables.length > 0) {
      sentMessagesWithClaimables.push({ sentMessage, claimables });
      withdrawalHashes.push(...claimables);
    }
  }
  const pendingWithdrawalHashes = await fetchPendingWithdrawalHashes(
    ethereumClient,
    currentBlockNumber,
    null,
    withdrawalHashes,
  );

  for (const { sentMessage, claimables } of sentMessagesWithClaimables) {
    const pendingWithdrawals = pendingWithdrawalHashes.filter((hash) => claimables.includes(hash));
    if (pendingWithdrawals.length > 0) {
      const calldataBatch = processBatchedCalldata(pendingWithdrawals);
      for (const calldata of calldataBatch) {
        await relayMessageWithProof(ethereumClient, {
          ...sentMessage,
          message: calldata.encodedCalldata,
        });
      }
    }
  }
};

const processBatchedCalldata = (claimables: string[]) => {
  const functionData = prepareEncodeFunctionData({
    abi: LiquidityAbi,
    functionName: "processWithdrawals",
  });

  const batchedCalldata: BatchedCalldata[] = [];
  for (let i = 0; i < claimables.length; i += MAX_BATCH_SIZE) {
    const batchWithdrawalHashes = claimables.slice(i, i + MAX_BATCH_SIZE);
    const encodedCalldata = encodeFunctionData({
      ...functionData,
      args: [[], batchWithdrawalHashes],
    });

    batchedCalldata.push({ encodedCalldata });
  }

  return batchedCalldata;
};
