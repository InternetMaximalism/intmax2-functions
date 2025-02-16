import { Timestamp } from "@google-cloud/firestore";
import {
  Alchemy,
  type BlockBuilderHeartbeatEvent,
  FIRESTORE_DOCUMENTS,
  getIndexer,
  getRandomNumber,
} from "@intmax2-functions/shared";
import { BATCH_SIZE } from "../constants";

export const processIndexer = async (events: BlockBuilderHeartbeatEvent[]) => {
  const lastIndexerEvents = events.reduce((acc, event) => {
    const existing = acc.get(event.args.blockBuilder);
    if (!existing || existing.blockNumber < event.blockNumber) {
      acc.set(event.args.blockBuilder, event);
    }
    return acc;
  }, new Map<string, BlockBuilderHeartbeatEvent>());

  const alchemy = new Alchemy();
  const indexerEvents = Array.from(lastIndexerEvents.values());

  const indexerInfos = [];
  for (let i = 0; i < indexerEvents.length; i += BATCH_SIZE) {
    const batch = indexerEvents.slice(i, i + BATCH_SIZE);
    const indexerPromises = batch.map(async (event) => {
      const block = await alchemy.getBlock(event.blockNumber);
      if (!block) {
        throw new Error(`Block not found: ${event.blockNumber}`);
      }
      return {
        address: event.args.blockBuilder,
        info: {
          lastSyncTime: Timestamp.fromDate(new Date(block.timestamp * 1000)),
          url: event.args.url,
          speed: getRandomNumber(1, 10, 0),
          fee: getRandomNumber(0.001, 0.1, 3),
          active: true,
        },
      };
    });

    const indexerInfo = await Promise.all(indexerPromises);
    indexerInfos.push(...indexerInfo);
  }

  const indexer = getIndexer(FIRESTORE_DOCUMENTS.BUILDERS);
  await indexer.upsertIndexersBatch(indexerInfos);

  return indexerInfos;
};
