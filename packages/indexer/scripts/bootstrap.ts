import {
  type Address,
  FIRESTORE_DOCUMENTS,
  FirestoreDocumentKey,
  type IndexerInfo,
  config,
  getIndexer,
  getRandomNumber,
  logger,
} from "@intmax2-functions/shared";

// dev
const data = [
  {
    address: "0x",
    doc: FIRESTORE_DOCUMENTS.BUILDERS,
    url: config.BLOCK_BUILDER_URL,
  },
];

const getIndexerInfo = ({
  address,
  url,
}: {
  address: Address;
  doc: FirestoreDocumentKey;
  url: string;
}): IndexerInfo => {
  return {
    address,
    info: {
      url,
      speed: getRandomNumber(1, 10, 0),
      fee: getRandomNumber(0.001, 0.1, 3),
      active: true,
    },
  };
};

const bootstrap = async () => {
  for (const d of data) {
    const indexer = getIndexer(d.doc);
    const indexerInfo = getIndexerInfo(d);
    await indexer.upsertIndexersBatch([indexerInfo]);
    logger.info(`Indexer info ${d.doc} added successfully`);
  }
};
bootstrap();
