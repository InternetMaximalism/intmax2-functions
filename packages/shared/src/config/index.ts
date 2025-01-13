import { url, bool, cleanEnv, num, str } from "envalid";

export const config = cleanEnv(process.env, {
  // app
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  PORT: num({ default: 3000 }),
  LOG_LEVEL: str({
    choices: ["fatal", "error", "warn", "info", "debug", "trace"],
    default: "debug",
  }),
  // gcp
  K_SERVICE: str({ default: process.env.CLOUD_RUN_JOB || "default-service" }),
  K_REVISION: str({ default: process.env.CLOUD_RUN_EXECUTION || "default-revision" }),
  GOOGLE_CLOUD_PROJECT: str({ devDefault: "local-project" }),
  GOOGLE_STORE_BUCKET: str({ devDefault: "local-bucket" }),
  // firebase
  FIRESTORE_DATABASE_ID: str({ devDefault: "(default)" }),
  // blockchain
  ALCHEMY_API_KEY: str({ devDefault: "dummy" }),
  NETWORK_TYPE: str({
    choices: ["ethereum", "scroll"],
    default: "ethereum",
  }),
  NETWORK_ENVIRONMENT: str({
    choices: ["mainnet", "sepolia"],
    default: "sepolia",
  }),
  // predicate
  PREDICATE_API_URL: url({ devDefault: "http://localhost:3001" }),
  PREDICATE_API_KEY: str({ devDefault: "dummy" }),
  // contract(set must be lowercase for contract addresses)
  LIQUIDITY_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  LIQUIDITY_CONTRACT_DEPLOYED_BLOCK: num({ devDefault: 0 }),
  WITHDRAWAL_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  L1_SCROLL_MESSENGER_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK: num({ devDefault: 0 }),
  MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  MOCK_L2_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK: num({ devDefault: 0 }),
  // private key
  INTMAX2_OWNER_MNEMONIC: str({ devDefault: "" }),
  MOCK_MESSENGER_PRIVATE_KEY: str({ devDefault: "" }),
  // scroll
  SCROLL_GAS_MULTIPLIER: num({ default: 2 }),
  // mining
  CLAIM_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  MINTER_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  STAKING_RELAYER_ENABLED: bool({ default: false }),
});
