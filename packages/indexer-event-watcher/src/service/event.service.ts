import {
  BLOCK_RANGE_NORMAL,
  BUILDER_REGISTRY_CONTRACT_ADDRESS,
  BUILDER_REGISTRY_CONTRACT_DEPLOYED_BLOCK,
  type BlockBuilderHeartbeatEvent,
  type EventData,
  blockBuilderHeartbeatEvent,
  fetchEvents,
  getStartBlockNumber,
  validateBlockRange,
} from "@intmax2-functions/shared";
import type { PublicClient } from "viem";

export const getHeartBeatEvents = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: EventData | null,
) => {
  const startBlockNumber = getStartBlockNumber(
    lastProcessedEvent,
    BUILDER_REGISTRY_CONTRACT_DEPLOYED_BLOCK,
  );
  validateBlockRange("blockBuilderHeartbeatEvent", startBlockNumber, currentBlockNumber);

  const heartBeatEvents = await fetchEvents<BlockBuilderHeartbeatEvent>(ethereumClient, {
    startBlockNumber,
    endBlockNumber: currentBlockNumber,
    blockRange: BLOCK_RANGE_NORMAL,
    contractAddress: BUILDER_REGISTRY_CONTRACT_ADDRESS,
    eventInterface: blockBuilderHeartbeatEvent,
  });

  return heartBeatEvents;
};
