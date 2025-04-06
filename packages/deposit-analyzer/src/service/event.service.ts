import {
  BLOCK_RANGE_MINIMUM,
  type DepositEvent,
  type DepositsRelayedEvent,
  type EventData,
  LIQUIDITY_CONTRACT_ADDRESS,
  LIQUIDITY_CONTRACT_DEPLOYED_BLOCK,
  LiquidityAbi,
  depositedEvent,
  depositsRelayedEvent,
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

export const getDepositsRelayedEvent = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: EventData | null,
) => {
  try {
    const startBlockNumber = getStartBlockNumber(
      lastProcessedEvent,
      LIQUIDITY_CONTRACT_DEPLOYED_BLOCK,
    );
    validateBlockRange("depositsRelayedEvent", startBlockNumber, currentBlockNumber);

    const depositsRelayedEvents = await fetchEvents<DepositsRelayedEvent>(ethereumClient, {
      startBlockNumber,
      endBlockNumber: currentBlockNumber,
      blockRange: BLOCK_RANGE_MINIMUM,
      contractAddress: LIQUIDITY_CONTRACT_ADDRESS,
      eventInterface: depositsRelayedEvent,
    });

    const depositsRelayedEventLogs = depositsRelayedEvents.map((event) => event.args);
    const upToDepositIds = depositsRelayedEventLogs.map((log) => log.upToDepositId);

    return {
      lastUpToDepositId: getMaxDepositId(upToDepositIds),
      rejectDepositIds: [],
    };
  } catch (error) {
    logger.error(
      `Error fetching depositsRelayedEvent events: ${error instanceof Error ? error.message : "Unknown error"}`,
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
