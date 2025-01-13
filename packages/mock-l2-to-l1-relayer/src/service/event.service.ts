import {
  BLOCK_RANGE_MINIMUM,
  type EventData,
  config,
  fetchEvents,
  getStartBlockNumber,
  l2MockSentMessageEvent,
  logger,
  withdrawalClaimableEvent,
} from "@intmax2-functions/shared";
import type { PublicClient } from "viem";
import {
  CONTRACT_PAIRS,
  LIQUIDITY_CONTRACT_ADDRESS,
  LIQUIDITY_CONTRACT_DEPLOYED_BLOCK,
  MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS,
  MOCK_L2_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK,
} from "../constants";
import type { SentMessageEvent, WithdrawalClaimableEvent } from "../types";

export const getL2SentMessage = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: EventData | null,
) => {
  const startBlockNumber = getStartBlockNumber(
    lastProcessedEvent,
    MOCK_L2_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK,
  );

  logger.info(
    `Fetching SentMessage events from block ${startBlockNumber} to ${currentBlockNumber}`,
  );

  if (startBlockNumber > currentBlockNumber) {
    throw new Error(
      `startBlockNumber ${startBlockNumber} is greater than currentBlockNumber ${currentBlockNumber}`,
    );
  }

  const filterArgs = config.STAKING_RELAYER_ENABLED
    ? CONTRACT_PAIRS.STAKING
    : CONTRACT_PAIRS.LIQUIDITY;
  const sentMessageEvents = await fetchEvents<SentMessageEvent>(ethereumClient, {
    startBlockNumber,
    endBlockNumber: currentBlockNumber,
    blockRange: BLOCK_RANGE_MINIMUM,
    contractAddress: MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS,
    eventInterface: l2MockSentMessageEvent,
    args: filterArgs,
  });
  const sentEventLogs = sentMessageEvents.map((event) => event.args);

  return sentEventLogs;
};

export const fetchPendingWithdrawalHashes = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: EventData | null,
  withdrawalHashes: string[],
) => {
  const startBlockNumber = getStartBlockNumber(
    lastProcessedEvent,
    LIQUIDITY_CONTRACT_DEPLOYED_BLOCK,
  );

  logger.info(
    `Fetching WithdrawalClaimable events from block ${startBlockNumber} to ${currentBlockNumber}`,
  );

  const events = await fetchEvents<WithdrawalClaimableEvent>(ethereumClient, {
    startBlockNumber,
    endBlockNumber: currentBlockNumber,
    blockRange: BLOCK_RANGE_MINIMUM,
    contractAddress: LIQUIDITY_CONTRACT_ADDRESS,
    eventInterface: withdrawalClaimableEvent,
    args: {
      withdrawalHash: withdrawalHashes,
    },
  });
  const processedEvents = events.map((log) => ({
    ...log.args,
  }));
  const processedHashes = processedEvents.map((event) => event.withdrawalHash);
  const pendingHashes = withdrawalHashes.filter((hash) => !processedHashes.includes(hash));

  return pendingHashes;
};
