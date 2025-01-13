import {
  BLOCK_RANGE_MINIMUM,
  type EventData,
  type L1SentMessageEvent,
  fetchEvents,
  getStartBlockNumber,
  l1SentMessageEvent,
  logger,
} from "@intmax2-functions/shared";
import type { PublicClient } from "viem";
import {
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS,
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK,
} from "../constants";

export const fetchSentMessages = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: EventData | null,
) => {
  const startBlockNumber = getStartBlockNumber(
    lastProcessedEvent,
    MOCK_L1_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK,
  );

  logger.info(`Fetching sent messages from block ${startBlockNumber} to ${currentBlockNumber}`);

  if (startBlockNumber > currentBlockNumber) {
    throw new Error(
      `startBlockNumber ${startBlockNumber} is greater than currentBlockNumber ${currentBlockNumber}`,
    );
  }

  const l1SentMessageEvents = await fetchEvents<L1SentMessageEvent>(ethereumClient, {
    startBlockNumber,
    endBlockNumber: currentBlockNumber,
    blockRange: BLOCK_RANGE_MINIMUM,
    contractAddress: MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS,
    eventInterface: l1SentMessageEvent,
  });

  return l1SentMessageEvents;
};
