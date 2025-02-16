import {
  BLOCK_RANGE_MINIMUM,
  type EventData,
  LIQUIDITY_CONTRACT_ADDRESS,
  LIQUIDITY_CONTRACT_DEPLOYED_BLOCK,
  MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS,
  MOCK_L2_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK,
  type SentMessageEvent,
  type WithdrawalClaimableEvent,
  fetchEvents,
  getStartBlockNumber,
  l2MockSentMessageEvent,
  validateBlockRange,
  withdrawalClaimableEvent,
} from "@intmax2-functions/shared";
import type { PublicClient } from "viem";

export const getL2SentMessage = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: EventData | null,
) => {
  const startBlockNumber = getStartBlockNumber(
    lastProcessedEvent,
    MOCK_L2_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK,
  );
  validateBlockRange("SentMessage", startBlockNumber, currentBlockNumber);

  const sentMessageEvents = await fetchEvents<SentMessageEvent>(ethereumClient, {
    startBlockNumber,
    endBlockNumber: currentBlockNumber,
    blockRange: BLOCK_RANGE_MINIMUM,
    contractAddress: MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS,
    eventInterface: l2MockSentMessageEvent,
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
  validateBlockRange("WithdrawalClaimable", startBlockNumber, currentBlockNumber);

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
