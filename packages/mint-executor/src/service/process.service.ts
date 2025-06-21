import {
  ITX_AMOUNT_TO_LIQUIDITY,
  MintEvent,
  createNetworkClient,
  logger,
} from "@intmax2-functions/shared";
import { getMintedEvent, getTransferredToLiquidityEvent } from "./event.service";
import { mint } from "./mint.service";
import { transferToLiquidity } from "./transfer.service";
import { shouldExecuteMint, shouldExecuteTransfer } from "./interval.service";

interface ProcessedEvents {
  mint: any;
  transferToLiquidity: any;
}

export const processEvents = async (
  ethereumClient: ReturnType<typeof createNetworkClient>,
  mintEvent: MintEvent,
  startBlockNumber: bigint,
  currentBlockNumber: bigint,
) => {
  const [lastEvents, newEvents] = await Promise.all([
    getLastProcessedEvents(mintEvent),
    getNewEvents(ethereumClient, startBlockNumber, currentBlockNumber),
  ]);

  await saveNewEvents(mintEvent, lastEvents, newEvents);
};

const getLastProcessedEvents = async (mintEvent: MintEvent) => {
  const [lastMintedEvent, lastTransferredEvent] = await Promise.all([
    mintEvent.getLatestEventByType("mint"),
    mintEvent.getLatestEventByType("transferToLiquidity"),
  ]);

  return {
    mint: lastMintedEvent,
    transferToLiquidity: lastTransferredEvent,
  };
};

const getNewEvents = async (
  ethereumClient: ReturnType<typeof createNetworkClient>,
  startBlockNumber: bigint,
  currentBlockNumber: bigint,
) => {
  const [mintedEvents, transferredEvents] = await Promise.all([
    getMintedEvent(ethereumClient, startBlockNumber, currentBlockNumber),
    getTransferredToLiquidityEvent(ethereumClient, startBlockNumber, currentBlockNumber),
  ]);

  return {
    mint: mintedEvents[0] || null,
    transferToLiquidity: transferredEvents[0] || null,
  };
};

const saveNewEvents = async (
  mintEvent: MintEvent,
  lastEvents: ProcessedEvents,
  newEvents: ProcessedEvents,
) => {
  const savePromises = [];

  if (isNewEvent(newEvents.mint, lastEvents.mint)) {
    logger.warn("New minted event detected:", newEvents.mint);
    savePromises.push(
      mintEvent.addEvent({
        type: "mint",
        blockNumber: Number(newEvents.mint.blockNumber),
        transactionHash: newEvents.mint.transactionHash.toLowerCase(),
      }),
    );
  }

  if (isNewEvent(newEvents.transferToLiquidity, lastEvents.transferToLiquidity)) {
    logger.warn("New transferred event detected:", newEvents.transferToLiquidity);
    savePromises.push(
      mintEvent.addEvent({
        type: "transferToLiquidity",
        blockNumber: Number(newEvents.transferToLiquidity.blockNumber),
        transactionHash: newEvents.transferToLiquidity.transactionHash.toLowerCase(),
      }),
    );
  }

  if (savePromises.length > 0) {
    await Promise.all(savePromises);
  }
};

const isNewEvent = (newEvent: any, lastEvent: any): boolean => {
  return newEvent && newEvent.transactionHash !== lastEvent?.transactionHash;
};

export const executeAutomaticOperations = async (
  ethereumClient: ReturnType<typeof createNetworkClient>,
  mintEvent: MintEvent,
) => {
  const [lastMintedEvent, lastTransferredEvent] = await Promise.all([
    mintEvent.getLatestEventByType("mint"),
    mintEvent.getLatestEventByType("transferToLiquidity"),
  ]);

  const now = Date.now();

  const shouldMint = shouldExecuteMint(now, lastMintedEvent);
  logger.info(
    `Should mint: ${shouldMint} - Last Minted Event: ${lastMintedEvent?.createdAt?.toDate()}`,
  );
  if (shouldMint) {
    await executeMintOperation(ethereumClient, mintEvent);
  }

  const shouldTransfer = shouldExecuteTransfer(now, lastTransferredEvent);
  logger.info(
    `Should transfer: ${shouldTransfer} - Last Transferred Event: ${lastTransferredEvent?.createdAt?.toDate()}`,
  );
  if (shouldTransfer) {
    await executeTransferOperation(ethereumClient, mintEvent);
  }
};

const executeMintOperation = async (
  ethereumClient: ReturnType<typeof createNetworkClient>,
  mintEvent: MintEvent,
) => {
  logger.info("Executing mint operation");

  const receipt = await mint(ethereumClient);
  await mintEvent.addEvent({
    type: "mint",
    blockNumber: Number(receipt.blockNumber),
    transactionHash: receipt.hash.toLowerCase(),
  });
};

const executeTransferOperation = async (
  ethereumClient: ReturnType<typeof createNetworkClient>,
  mintEvent: MintEvent,
) => {
  logger.info("Executing transfer to liquidity operation");

  const receipt = await transferToLiquidity(ethereumClient, BigInt(ITX_AMOUNT_TO_LIQUIDITY));
  await mintEvent.addEvent({
    type: "transferToLiquidity",
    blockNumber: Number(receipt.blockNumber),
    transactionHash: receipt.hash.toLowerCase(),
  });
};
