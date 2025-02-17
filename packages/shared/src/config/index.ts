import { url, cleanEnv, num, str } from "envalid";

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
  // auth
  ALLOWED_ORIGINS: str({ default: "*" }),
  AUTH_IP_ALLOW_LIST: str({ devDefault: "127.0.0.1,::1" }),
  // gcp
  K_SERVICE: str({ default: process.env.CLOUD_RUN_JOB || "default-service" }),
  K_REVISION: str({ default: process.env.CLOUD_RUN_EXECUTION || "default-revision" }),
  GOOGLE_CLOUD_PROJECT: str({ devDefault: "local-project" }),
  GOOGLE_STORE_BUCKET: str({ devDefault: "local-bucket" }),
  // firestore
  FIRESTORE_DATABASE_ID: str({ devDefault: "(default)" }),
  // block builder
  BLOCK_BUILDER_URL: url({ devDefault: "http://localhost:3001" }),
  // network
  NETWORK_TYPE: str({
    choices: ["ethereum", "scroll"],
    default: "ethereum",
  }),
  NETWORK_ENVIRONMENT: str({
    choices: ["mainnet", "sepolia"],
    default: "sepolia",
  }),
  // blockchain
  ALCHEMY_API_KEY: str({ devDefault: "dummy" }),
  // predicate
  PREDICATE_API_URL: url({ devDefault: "http://localhost:3002" }),
  PREDICATE_API_KEY: str({ devDefault: "dummy" }),
  // contract(must be lowercase for contract address)
  BUILDER_REGISTRY_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  BUILDER_REGISTRY_CONTRACT_DEPLOYED_BLOCK: num({ devDefault: 0 }),
  LIQUIDITY_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  LIQUIDITY_CONTRACT_DEPLOYED_BLOCK: num({ devDefault: 0 }),
  WITHDRAWAL_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  CLAIM_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  ROLLUP_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  // messenger contract
  L1_SCROLL_MESSENGER_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS: str({ default: "0x" }),
  MOCK_L1_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK: num({ default: 0 }),
  MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS: str({ default: "0x" }),
  MOCK_L2_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK: num({ default: 0 }),
  // private key
  INTMAX2_OWNER_MNEMONIC: str({ devDefault: "" }),
  MOCK_MESSENGER_PRIVATE_KEY: str({ default: "0x" }),
  // discord
  DISCORD_BOT_TOKEN: str({ default: "dummy" }),
  DISCORD_BOT_INFO_CHANNEL_ID: str({ default: "dummy" }),
  DISCORD_BOT_ERROR_CHANNEL_ID: str({ default: "dummy" }),
  // scroll
  SCROLL_GAS_MULTIPLIER: num({ default: 2 }),
  // validity prover
  API_VALIDITY_PROVER_BASE_URL: str({ default: "http://localhost:3003" }),
});
