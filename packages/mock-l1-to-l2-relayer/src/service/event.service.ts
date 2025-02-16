import {
  BLOCK_RANGE_MINIMUM,
  type EventData,
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS,
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK,
  type SentMessageEvent,
  fetchEvents,
  getStartBlockNumber,
  l1SentMessageEvent,
  validateBlockRange,
} from "@intmax2-functions/shared";
import type { PublicClient } from "viem";

export const fetchSentMessages = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: EventData | null,
) => {
  const startBlockNumber = getStartBlockNumber(
    lastProcessedEvent,
    MOCK_L1_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK,
  );
  validateBlockRange("SentMessage", startBlockNumber, currentBlockNumber);

  const l1SentMessageEvents = await fetchEvents<SentMessageEvent>(ethereumClient, {
    startBlockNumber,
    endBlockNumber: currentBlockNumber,
    blockRange: BLOCK_RANGE_MINIMUM,
    contractAddress: MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS,
    eventInterface: l1SentMessageEvent,
  });

  return l1SentMessageEvents;
};
