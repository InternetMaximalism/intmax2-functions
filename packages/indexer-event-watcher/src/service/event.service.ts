import {
  BLOCK_RANGE_MINIMUM,
  BUILDER_REGISTRY_CONTRACT_ADDRESS,
  type BlockBuilderHeartbeatEvent,
  blockBuilderHeartbeatEvent,
  fetchEvents,
} from "@intmax2-functions/shared";
import type { PublicClient } from "viem";

export const getHeartBeatEvents = async (
  ethereumClient: PublicClient,
  startBlockNumber: bigint,
  currentBlockNumber: bigint,
) => {
  const heartBeatEvents = await fetchEvents<BlockBuilderHeartbeatEvent>(ethereumClient, {
    startBlockNumber,
    endBlockNumber: currentBlockNumber,
    blockRange: BLOCK_RANGE_MINIMUM,
    contractAddress: BUILDER_REGISTRY_CONTRACT_ADDRESS,
    eventInterface: blockBuilderHeartbeatEvent,
  });

  return heartBeatEvents;
};
