import { FIRESTORE_DOCUMENTS, getIndexer } from "@intmax2-functions/shared";
import { getRandomBuilders } from "../lib/builder";

export const listBlockBuilderNodes = async () => {
  const indexerInstance = getIndexer(FIRESTORE_DOCUMENTS.BUILDERS);
  const activeBuilders = await indexerInstance.listIndexers();

  return getRandomBuilders(activeBuilders);
};

export const getBlockBuilderMeta = async () => {
  const indexerInstance = getIndexer(FIRESTORE_DOCUMENTS.BUILDERS);
  const activeBuilders = await indexerInstance.listIndexers();

  return {
    total: activeBuilders.length,
  };
};

export const checkIndexerRegistration = async (address: string) => {
  const indexerInstance = getIndexer(FIRESTORE_DOCUMENTS.BUILDERS);
  const indexers = await indexerInstance.fetchIndexers({ addresses: [address] });

  return {
    registered: indexers.length > 0,
    ready: indexers.some((indexer) => indexer.active),
  };
};
