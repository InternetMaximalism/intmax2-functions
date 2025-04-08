import { type DepositEvent } from "@intmax2-functions/shared";
import { GAS_CONFIG, SUMMARY_BATCH_SIZE } from "../constants";
import type { BatchParams } from "../types";

const calculateAnalyzeAndRelayGasLimit = (numDepositsToRelay: number) => {
  const { baseGas, perDepositGas, bufferGas } = GAS_CONFIG;

  return BigInt(baseGas + perDepositGas * numDepositsToRelay + bufferGas);
};

export const splitDepositSummary = async (
  processedDepositEvents: DepositEvent[],
  processedState: {
    lastUpToDepositId: bigint;
  },
  currentBlockNumber: bigint,
) => {
  const sortedDepositIds = processedDepositEvents
    .map(({ args }) => args.depositId)
    .sort((a, b) => Number(b - a));
  const maxDepositId = sortedDepositIds[0] as bigint;
  if (!maxDepositId) {
    throw new Error("No maxDepositId found");
  }
  const minDepositId = sortedDepositIds[sortedDepositIds.length - 1];

  if (processedState.lastUpToDepositId >= maxDepositId) {
    return {
      shouldSubmit: false,
      batches: [],
    };
  }

  const batches: BatchParams[] = [];
  const depositIds = generateDepositIds(Number(minDepositId), Number(maxDepositId));

  let currentStartDepositId = minDepositId;
  for (let i = 0; i < depositIds.length; i += SUMMARY_BATCH_SIZE) {
    const batchDepositIds = depositIds.slice(i, i + SUMMARY_BATCH_SIZE);
    const isLastBatch = i + SUMMARY_BATCH_SIZE >= depositIds.length;
    const batchUpToDepositId = isLastBatch
      ? maxDepositId
      : batchDepositIds[batchDepositIds.length - 1];
    const numDepositsToRelay = batchUpToDepositId - currentStartDepositId + 1n;

    if (numDepositsToRelay < 0n) {
      throw new Error(
        `Invalid numDepositsToRelay calculated: ${numDepositsToRelay} ` +
          `(range: ${currentStartDepositId} to ${batchUpToDepositId}`,
      );
    }
    const gasLimit = calculateAnalyzeAndRelayGasLimit(Number(numDepositsToRelay));
    const blockNumber = getEventBlockNumber(processedDepositEvents, batchUpToDepositId);

    const batchParams: BatchParams = {
      upToDepositId: batchUpToDepositId,
      numDepositsToRelay,
      gasLimit,
      blockNumber: isLastBatch ? currentBlockNumber : blockNumber,
    };

    batches.push(batchParams);

    currentStartDepositId = batchUpToDepositId + 1n;
  }

  return {
    shouldSubmit: true,
    batches,
  };
};

const getEventBlockNumber = (processedDepositEvents: DepositEvent[], depositId: bigint) => {
  const index = processedDepositEvents.findIndex((event) => event.args.depositId === depositId);
  if (index === -1) {
    throw new Error(`DepositId ${depositId} not found.`);
  }
  return processedDepositEvents[index].blockNumber;
};

const generateDepositIds = (minDepositId: number, maxDepositId: number): bigint[] => {
  const depositIds = Array.from({ length: maxDepositId - minDepositId + 1 }, (_, index) =>
    BigInt(minDepositId + index),
  );
  return depositIds;
};
