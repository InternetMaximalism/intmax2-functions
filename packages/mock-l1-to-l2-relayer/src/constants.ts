import { config } from "@intmax2-functions/shared";

// batch
export const MAX_BATCH_SIZE = 250;

// blockchain
export const MOCK_L1_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK =
  config.MOCK_L1_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK;
export const MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS =
  config.MOCK_L1_SCROLL_MESSENGER_CONTRACT_ADDRESS as `0x${string}`;
export const MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS =
  config.MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS as `0x${string}`;

// transaction
export const SCROLL_TRANSACTION_MAX_RETRIES = 5;
export const RELAY_MESSAGE_ALREADY_EXECUTED = "Message was already successfully executed";
