import { FIRESTORE_DOCUMENTS, getIndexer } from "@intmax2-functions/shared";

export const listBlockBuilderNodes = async () => {
  const indexer = getIndexer(FIRESTORE_DOCUMENTS.BUILDERS);
  return indexer.listIndexers();
};

export const listValidityProverNodes = async () => {
  const indexer = getIndexer(FIRESTORE_DOCUMENTS.VALIDITY_PROVERS);
  return indexer.listIndexers();
};

export const listWithdrawalAggregatorNodes = async () => {
  const indexer = getIndexer(FIRESTORE_DOCUMENTS.WITHDRAWAL_AGGREGATORS);
  return indexer.listIndexers();
};
