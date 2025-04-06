import { FIRESTORE_DOCUMENTS, getIndexer, logger } from "@intmax2-functions/shared";
import { fetchRecentSyncIndexerBuilders } from "./indexer.service";
import { processMonitor } from "./monitor.service";

export const performJob = async (): Promise<void> => {
  const indexer = getIndexer(FIRESTORE_DOCUMENTS.BUILDERS);
  const indexers = await fetchRecentSyncIndexerBuilders(indexer);
  const activeIndexers = await processMonitor(indexers);
  await indexer.syncIndexerActiveStates(activeIndexers.map((indexer) => indexer.address));
  logger.info(`Active indexers updated: ${activeIndexers.length}`);
};
