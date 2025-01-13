import { config } from "@intmax2-functions/shared";

// scroll
export const SCROLL_API_BRIDGE_URL = {
  mainnet: "https://mainnet-api-bridge-v2.scroll.io/api/l2/unclaimed/withdrawals",
  sepolia: "https://sepolia-api-bridge-v2.scroll.io/api/l2/unclaimed/withdrawals",
};
export const SUCCESS_CODE = 0;
export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;
export const DEFAULT_SLEEP_TIME = 1000;

// blockchain
export const L1_SCROLL_MESSENGER_CONTRACT_ADDRESS =
  config.WITHDRAWAL_CONTRACT_ADDRESS as `0x${string}`;
export const RELAY_MESSAGE_ALREADY_EXECUTED = "Message was already successfully executed";

// transaction
export const TRANSACTION_MAX_RETRIES = 5;
export const WITHDRAWAL_WAIT_TRANSACTION_TIMEOUT = 30_000;
export const INCREMENT_RATE = 0.3;

// batch
export const MAX_BATCH_SIZE = 250;
