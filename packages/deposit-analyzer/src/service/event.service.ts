import {
  BLOCK_RANGE_MINIMUM,
  type DepositEvent,
  type DepositsAnalyzedAndRelayedEvent,
  type EventData,
  LIQUIDITY_CONTRACT_ADDRESS,
  LIQUIDITY_CONTRACT_DEPLOYED_BLOCK,
  LiquidityAbi,
  depositedEvent,
  depositsAnalyzedAndRelayedEvent,
  fetchEvents,
  getStartBlockNumber,
  logger,
  validateBlockRange,
} from "@intmax2-functions/shared";
import type { Abi, PublicClient } from "viem";

export const getDepositedEvent = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: EventData | null,
) => {
  try {
    const startBlockNumber = getStartBlockNumber(
      lastProcessedEvent,
      LIQUIDITY_CONTRACT_DEPLOYED_BLOCK,
    );
    validateBlockRange("depositedEvent", startBlockNumber, currentBlockNumber);

    const depositEvents = await fetchEvents<DepositEvent>(ethereumClient, {
      startBlockNumber,
      endBlockNumber: currentBlockNumber,
      blockRange: BLOCK_RANGE_MINIMUM,
      contractAddress: LIQUIDITY_CONTRACT_ADDRESS,
      eventInterface: depositedEvent,
    });

    if (depositEvents.length !== 0 && lastProcessedEvent === null) {
      const lastRelayedDepositId = (await ethereumClient.readContract({
        address: LIQUIDITY_CONTRACT_ADDRESS,
        abi: LiquidityAbi as Abi,
        functionName: "getLastRelayedDepositId",
        args: [],
        blockNumber: currentBlockNumber,
      })) as bigint;

      const filteredEvents = depositEvents.filter(
        ({ args }) => args.depositId > lastRelayedDepositId,
      );
      return filteredEvents;
    }

    return depositEvents;
  } catch (error) {
    logger.error(
      `Error fetching deposited events: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    throw error;
  }
};

export const getDepositsAnalyzedAndRelayedEvent = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: EventData | null,
) => {
  try {
    const startBlockNumber = getStartBlockNumber(
      lastProcessedEvent,
      LIQUIDITY_CONTRACT_DEPLOYED_BLOCK,
    );
    validateBlockRange("depositsAnalyzedAndRelayedEvent", startBlockNumber, currentBlockNumber);

    const depositsAnalyzedAndRelayedEvents = await fetchEvents<DepositsAnalyzedAndRelayedEvent>(
      ethereumClient,
      {
        startBlockNumber,
        endBlockNumber: currentBlockNumber,
        blockRange: BLOCK_RANGE_MINIMUM,
        contractAddress: LIQUIDITY_CONTRACT_ADDRESS,
        eventInterface: depositsAnalyzedAndRelayedEvent,
      },
    );

    const depositsAnalyzedAndRelayedEventLogs = depositsAnalyzedAndRelayedEvents.map(
      (event) => event.args,
    );
    const rejectDepositIds = depositsAnalyzedAndRelayedEventLogs.map((log) => log.rejectDepositIds);
    const upToDepositIds = depositsAnalyzedAndRelayedEventLogs.map((log) => log.upToDepositId);

    return {
      lastUpToDepositId: getMaxDepositId(upToDepositIds),
      rejectDepositIds: rejectDepositIds.flat(),
    };
  } catch (error) {
    logger.error(
      `Error fetching depositsAnalyzedAndRelayedEvent events: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    throw error;
  }
};

const getMaxDepositId = (upToDepositIds: bigint[]) => {
  if (!upToDepositIds || upToDepositIds.length === 0) {
    return 0n;
  }

  return upToDepositIds.reduce((max, current) => {
    return current > max ? current : max;
  });
};
