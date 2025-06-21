import {
  BLOCK_RANGE_MINIMUM,
  MINTER_CONTRACT_ADDRESS,
  fetchEvents,
  logger,
  mintedEvent,
  type TransferredToLiquidityEvent,
  type MintedEvent,
  transferredToLiquidityEvent,
} from "@intmax2-functions/shared";
import type { PublicClient } from "viem";

export const getMintedEvent = async (
  ethereumClient: PublicClient,
  startBlockNumber: bigint,
  currentBlockNumber: bigint,
) => {
  try {
    const depositEvents = await fetchEvents<MintedEvent>(ethereumClient, {
      startBlockNumber,
      endBlockNumber: currentBlockNumber,
      blockRange: BLOCK_RANGE_MINIMUM,
      contractAddress: MINTER_CONTRACT_ADDRESS,
      eventInterface: mintedEvent,
    });

    return depositEvents;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error fetching minted events: ${message}`);
    throw error;
  }
};

export const getTransferredToLiquidityEvent = async (
  ethereumClient: PublicClient,
  startBlockNumber: bigint,
  currentBlockNumber: bigint,
) => {
  try {
    const depositEvents = await fetchEvents<TransferredToLiquidityEvent>(ethereumClient, {
      startBlockNumber,
      endBlockNumber: currentBlockNumber,
      blockRange: BLOCK_RANGE_MINIMUM,
      contractAddress: MINTER_CONTRACT_ADDRESS,
      eventInterface: transferredToLiquidityEvent,
    });

    return depositEvents;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error fetching transferredToLiquidity events: ${message}`);
    throw error;
  }
};
