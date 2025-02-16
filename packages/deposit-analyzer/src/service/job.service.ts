import {
  Event,
  type EventData,
  FIRESTORE_DOCUMENT_EVENTS,
  createNetworkClient,
  logger,
} from "@intmax2-functions/shared";
import { getDepositedEvent, getDepositsAnalyzedAndRelayedEvent } from "./event.service";
import { submitAnalyzeAndRelayDeposits } from "./submit.service";
import { splitDepositSummary } from "./summarize.service";

export const performJob = async () => {
  const ethereumClient = createNetworkClient("ethereum");
  const event = new Event(FIRESTORE_DOCUMENT_EVENTS.DEPOSITED);

  const [currentBlockNumber, lastProcessedEvent] = await Promise.all([
    await ethereumClient.getBlockNumber(),
    await event.getEvent<EventData>(),
  ]);

  await processAnalyzer(ethereumClient, currentBlockNumber, event, lastProcessedEvent);
};

const processAnalyzer = async (
  ethereumClient: ReturnType<typeof createNetworkClient>,
  currentBlockNumber: bigint,
  event: Event,
  lastProcessedEvent: EventData | null,
) => {
  const processedDepositEvents = await getDepositedEvent(
    ethereumClient,
    currentBlockNumber,
    lastProcessedEvent,
  );

  if (processedDepositEvents.length === 0) {
    logger.info("No new deposits found.");
    await updateEventState(event, currentBlockNumber);
    return;
  }

  logger.info(`New deposit events: ${processedDepositEvents.length}`);

  const processedState = await getDepositsAnalyzedAndRelayedEvent(
    ethereumClient,
    currentBlockNumber,
    lastProcessedEvent,
  );
  const depositSummary = await splitDepositSummary(
    processedDepositEvents,
    processedState,
    currentBlockNumber,
  );

  if (depositSummary.shouldSubmit) {
    for (const batch of depositSummary.batches) {
      await submitAnalyzeAndRelayDeposits(ethereumClient, batch);
      await updateEventState(event, batch.blockNumber);
    }
  }
};

const updateEventState = async (event: Event, currentBlockNumber: bigint) => {
  const eventData = {
    lastBlockNumber: Number(currentBlockNumber),
  };
  await event.addOrUpdateEvent(eventData);
};
