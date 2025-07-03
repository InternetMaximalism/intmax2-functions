import {
  BLOCK_RANGE_MINIMUM,
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS,
  type SentMessageEvent,
  fetchEvents,
  l1SentMessageEvent,
} from "@intmax2-function/shared";
import type { PublicClient } from "viem";

export const fetchSentMessages = async (
  ethereumClient: PublicClient,
  startBlockNumber: bigint,
  currentBlockNumber: bigint,
) => {
  const l1SentMessageEvents = await fetchEvents<SentMessageEvent>(ethereumClient, {
    startBlockNumber,
    endBlockNumber: currentBlockNumber,
    blockRange: BLOCK_RANGE_MINIMUM,
    contractAddress: MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS,
    eventInterface: l1SentMessageEvent,
  });

  return l1SentMessageEvents;
};
