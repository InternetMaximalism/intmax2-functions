import {
  Event,
  type EventData,
  FIRESTORE_DOCUMENT_EVENTS,
  MINTER_CONTRACT_DEPLOYED_BLOCK,
  createNetworkClient,
  getStartBlockNumber,
  logger,
  validateBlockRange,
} from "@intmax2-functions/shared";
import { getMintedEvent, getTransferredToLiquidityEvent } from "./event.service";
import { mint } from "./mint.service";
import { transferToLiquidity } from "./transfer.service";

export const performJob = async (): Promise<void> => {
  const ethereumClient = createNetworkClient("ethereum");
  const event = new Event(FIRESTORE_DOCUMENT_EVENTS.MINTER);

  const [currentBlockNumber, lastProcessedEvent] = await Promise.all([
    await ethereumClient.getBlockNumber(),
    await event.getEvent<EventData>(),
  ]);

  await processMinter(ethereumClient, currentBlockNumber, event, lastProcessedEvent);
};

const processMinter = async (
  ethereumClient: ReturnType<typeof createNetworkClient>,
  currentBlockNumber: bigint,
  event: Event,
  lastProcessedEvent: EventData | null,
) => {
  const startBlockNumber = getStartBlockNumber(lastProcessedEvent, MINTER_CONTRACT_DEPLOYED_BLOCK);
  const isValid = validateBlockRange("minterEvent", startBlockNumber, currentBlockNumber);
  if (!isValid) {
    logger.info("Skipping process process Minter due to invalid block range.");
    return;
  }

  await getMintedEvent(ethereumClient, startBlockNumber, currentBlockNumber);
  await getTransferredToLiquidityEvent(ethereumClient, startBlockNumber, currentBlockNumber);

  await mint(ethereumClient);
  await transferToLiquidity(ethereumClient, 0n);

  await updateEventState(event, currentBlockNumber);
};

const updateEventState = async (event: Event, currentBlockNumber: bigint) => {
  const eventData = {
    lastBlockNumber: Number(currentBlockNumber),
  };
  await event.addOrUpdateEvent(eventData);
};
