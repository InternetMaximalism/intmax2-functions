import type { DepositEvent, DepositEventLog } from "@intmax2-functions/shared";
import { GAS_CONFIG, SUMMARY_BATCH_SIZE } from "../constants";
import type { BatchParams } from "../types";

export const summarizeDepositAnalysis = async (
  results: Array<DepositEventLog & { isRejected: boolean }>,
  processedState: {
    lastUpToDepositId: bigint;
    rejectDepositIds: bigint[];
  },
) => {
  const sortedDepositIds = results.map((result) => result.depositId).sort((a, b) => Number(b - a));

  const upToDepositId = sortedDepositIds[0] as bigint;
  if (!upToDepositId) {
    throw new Error("No upToDepositId found.");
  }

  if (processedState.lastUpToDepositId >= upToDepositId) {
    return {
      shouldSubmit: false,
      upToDepositId,
      rejectDepositIds: [],
      numDepositsToRelay: 0,
      gasLimit: 0,
    };
  }

  const rejectDepositIds = results
    .filter((result) => result.isRejected) // NOTE: Attention
    .map((result) => result.depositId);

  const filterRejectDepositIds = rejectDepositIds.filter(
    (rejectDepositId) => !processedState.rejectDepositIds.includes(rejectDepositId),
  ); // NOTE: Prevents issues even when executed multiple times

  const numDepositsToRelay = sortedDepositIds.length - filterRejectDepositIds.length;
  const gasLimit = calculateAnalyzeAndRelayGasLimit(numDepositsToRelay);

  return {
    upToDepositId,
    rejectDepositIds: filterRejectDepositIds,
    numDepositsToRelay,
    gasLimit,
    shouldSubmit: true,
  };
};

export const summarizeDepositAnalysisForPredicate = async (
  results: DepositEventLog[],
  processedState: {
    lastUpToDepositId: bigint;
    rejectDepositIds: bigint[];
  },
) => {
  const sortedDepositIds = results.map((result) => result.depositId).sort((a, b) => Number(b - a));

  const upToDepositId = sortedDepositIds[0] as bigint;
  if (!upToDepositId) {
    throw new Error("No upToDepositId found.");
  }

  if (processedState.lastUpToDepositId >= upToDepositId) {
    return {
      shouldSubmit: false,
      upToDepositId,
      rejectDepositIds: [],
      numDepositsToRelay: 0,
      gasLimit: 0,
    };
  }

  const rejectDepositIds: bigint[] = []; // NOTE: Predicate prevents rejection on contract layer
  const filterRejectDepositIds = rejectDepositIds.filter(
    (rejectDepositId) => !processedState.rejectDepositIds.includes(rejectDepositId),
  ); // NOTE: Prevents issues even when executed multiple times

  const numDepositsToRelay = sortedDepositIds.length - filterRejectDepositIds.length;
  const gasLimit = calculateAnalyzeAndRelayGasLimit(numDepositsToRelay);

  return {
    upToDepositId,
    rejectDepositIds: filterRejectDepositIds,
    numDepositsToRelay,
    gasLimit,
    shouldSubmit: true,
  };
};

const calculateAnalyzeAndRelayGasLimit = (numDepositsToRelay: number) => {
  const { baseGas, perDepositGas, bufferGas } = GAS_CONFIG;

  return BigInt(baseGas + perDepositGas * numDepositsToRelay + bufferGas);
};

export const splitDepositSummary = async (
  processedDepositEvents: DepositEvent[],
  processedState: {
    lastUpToDepositId: bigint;
    rejectDepositIds: bigint[];
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

  // NOTE If isRejected is true, add depositId to this array
  const baseRejectDepositIds: bigint[] = [];
  // NOTE: Prevents issues even when executed multiple times
  const rejectDepositIds = baseRejectDepositIds.filter(
    (rejectDepositId) => !processedState.rejectDepositIds.includes(rejectDepositId),
  );
  const sortedRejectIds = [...rejectDepositIds].sort((a, b) => Number(a - b));

  if (rejectDepositIds.length === 0) {
    const numDepositsToRelay = maxDepositId - minDepositId + 1n;
    return {
      shouldSubmit: true,
      batches: [
        {
          upToDepositId: maxDepositId,
          rejectDepositIds: [],
          numDepositsToRelay,
          gasLimit: calculateAnalyzeAndRelayGasLimit(Number(numDepositsToRelay)),
          blockNumber: currentBlockNumber,
        },
      ],
    };
  }

  const batches = [];
  let currentStartDepositId = minDepositId;

  for (let i = 0; i < rejectDepositIds.length; i += SUMMARY_BATCH_SIZE) {
    const batchRejectDepositIds = sortedRejectIds.slice(i, i + SUMMARY_BATCH_SIZE);
    const isLastBatch = i + SUMMARY_BATCH_SIZE >= sortedRejectIds.length;

    const batchUpToDepositId = isLastBatch
      ? maxDepositId
      : sortedRejectIds[i + SUMMARY_BATCH_SIZE - 1];

    const depositsInRange = batchUpToDepositId - currentStartDepositId + 1n;
    const numDepositsToRelay = depositsInRange - BigInt(batchRejectDepositIds.length);

    if (numDepositsToRelay < 0n) {
      throw new Error(
        `Invalid numDepositsToRelay calculated: ${numDepositsToRelay} ` +
          `(range: ${currentStartDepositId} to ${batchUpToDepositId}, ` +
          `rejects: ${batchRejectDepositIds.length})`,
      );
    }
    const gasLimit = calculateAnalyzeAndRelayGasLimit(Number(numDepositsToRelay));
    const blockNumber = getEventBlockNumber(processedDepositEvents, batchUpToDepositId);

    const batchParams: BatchParams = {
      upToDepositId: batchUpToDepositId,
      rejectDepositIds: batchRejectDepositIds,
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
