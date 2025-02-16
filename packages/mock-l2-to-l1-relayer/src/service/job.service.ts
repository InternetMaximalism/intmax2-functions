import {
  Event,
  type EventData,
  FIRESTORE_DOCUMENT_EVENTS,
  createNetworkClient,
  logger,
} from "@intmax2-functions/shared";
import { generateCalldata } from "./decode.service";
import { getL2SentMessage } from "./event.service";
import { relayMessageWithProof } from "./submit.service";

export const performJob = async (): Promise<void> => {
  const scrollClient = createNetworkClient("scroll");
  const event = new Event(FIRESTORE_DOCUMENT_EVENTS.MOCK_L2_SENT_MESSAGE);

  const [currentBlockNumber, lastProcessedEvent] = await Promise.all([
    await scrollClient.getBlockNumber(),
    await event.getEvent<EventData>(),
  ]);

  const sentMessages = await getL2SentMessage(scrollClient, currentBlockNumber, lastProcessedEvent);

  logger.info(`New sentMessages events: ${sentMessages.length}`);

  const ethereumClient = createNetworkClient("ethereum");

  for (const sendMessage of sentMessages) {
    const calldataBatch = await generateCalldata(sendMessage);

    for (const calldata of calldataBatch) {
      await relayMessageWithProof(ethereumClient, {
        ...sendMessage,
        message: calldata.encodedCalldata,
      });
    }
  }

  await event.addOrUpdateEvent({
    lastBlockNumber: Number(currentBlockNumber),
  });
};
