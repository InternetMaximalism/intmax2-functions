// app
export const BASE_PATH = "v1";
export const APP_TIMEOUT = 30000;
export const RATE_LIMIT = 1000;

// logger
export const SLOW_THRESHOLD = 1000;
export const CLIENT_SERVICE = "clientServiceName";

// db
export const FIRESTORE_COLLECTIONS = {
  INDEXERS: "indexers",
  EVENTS: "events",
  TOKEN_MAPPINGS: "tokenMappings",
} as const;

export const FIRESTORE_DOCUMENTS = {
  BUILDERS: "builders",
  VALIDITY_PROVERS: "validityProvers",
  WITHDRAWAL_AGGREGATORS: "withdrawalAggregators",
} as const;

export const FIRESTORE_DOCUMENT_EVENTS = {
  DEPOSITED: "deposited",
  MOCK_MESSENGER_RELAYER: "mockMessengerRelayer",
  MOCK_L2_SENT_MESSAGE: "mockL2SentMessage",
} as const;

export const FIRESTORE_MAX_BATCH_SIZE = 500;
export const FIRESTORE_IN_MAX_BATCH_SIZE = 30;

// gcp
export const FILE_PATHS = {
  tokenPrices: "tokens/tokenPrices",
};

// transaction
export const WAIT_TRANSACTION_TIMEOUT = 30_000;

// block event
export const BLOCK_RANGE_MINIMUM = 10000n;
export const BLOCK_RANGE_NORMAL = 30000n;
export const BLOCK_RANGE_MAX = 100000n;

// errors
export const TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE =
  "Timed out while waiting for transaction with hash";
export const TRANSACTION_REPLACEMENT_FEE_TOO_LOW = "replacement fee too low";
