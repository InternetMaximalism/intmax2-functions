import {
  type DepositsRelayedEventData,
  Event,
  FIRESTORE_DOCUMENT_EVENTS,
  config,
  createNetworkClient,
  logger,
} from "@intmax2-functions/shared";
import type { PublicClient } from "viem";
import { fetchUnprocessedDepositTokenEntries } from "./event.service";
import { saveTokenIndexMappings } from "./mapper.service";

export const performJob = async (): Promise<void> => {
  const ethereumClient = createNetworkClient(config.NETWORK_TYPE);
  const event = new Event(FIRESTORE_DOCUMENT_EVENTS.DEPOSITS_RELAYED_TOKEN_MAPPER);
  const [currentBlockNumber, lastProcessedEvent] = await Promise.all([
    await ethereumClient.getBlockNumber(),
    event.getEvent<DepositsRelayedEventData>(),
  ]);

  const eventData = await processTokenMapper(
    ethereumClient,
    currentBlockNumber,
    lastProcessedEvent,
  );
  await updateEventData(event, eventData);
};

const processTokenMapper = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  lastProcessedEvent: DepositsRelayedEventData | null,
) => {
  const { depositIds, tokenInfoMap } = await fetchUnprocessedDepositTokenEntries(
    ethereumClient,
    currentBlockNumber,
    lastProcessedEvent,
  );

  if (depositIds.length === 0) {
    logger.info("No new deposits found.");
    return {
      lastBlockNumber: Number(currentBlockNumber),
    };
  }

  const results = await saveTokenIndexMappings(ethereumClient, tokenInfoMap);
  logger.info(`Added ${results.length} new token mappings.`);

  return {
    lastBlockNumber: Number(currentBlockNumber),
    lastUpToDepositId: Math.max(...depositIds.map(Number)),
  };
};

const updateEventData = async (
  event: Event,
  eventData: { lastBlockNumber: number; lastUpToDepositId?: number },
) => {
  await event.addOrUpdateEvent(eventData);
};
