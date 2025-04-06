import { BaseIndexer } from "@intmax2-functions/shared";

export const fetchRecentSyncIndexerBuilders = async (indexer: BaseIndexer) => {
  const dayAgoTimestamp = getTimeStampFromLast24Hours();
  const indexers = indexer.fetchIndexers({ lastSyncedTime: dayAgoTimestamp });
  return indexers;
};

const getTimeStampFromLast24Hours = () => {
  const now = new Date().getTime();
  return new Date(now - 1000 * 60 * 60 * 24);
};
