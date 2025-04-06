import { FIRESTORE_DOCUMENTS, getIndexer } from "@intmax2-functions/shared";
import { getRandomBuilders } from "../lib/builder";

export const listBlockBuilderNodes = async () => {
  const indexer = getIndexer(FIRESTORE_DOCUMENTS.BUILDERS);
  const activeBuilders = await indexer.listIndexers();
  return getRandomBuilders(activeBuilders);
};

export const getBlockBuilderMeta = async () => {
  const indexer = getIndexer(FIRESTORE_DOCUMENTS.BUILDERS);
  const activeBuilders = await indexer.listIndexers();

  return {
    total: activeBuilders.length,
  };
};
