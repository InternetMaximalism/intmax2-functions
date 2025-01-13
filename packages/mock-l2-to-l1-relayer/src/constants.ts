import { config } from "@intmax2-functions/shared";

// batch
export const MAX_BATCH_SIZE = 50;

// blockchain
export const LIQUIDITY_CONTRACT_ADDRESS = config.LIQUIDITY_CONTRACT_ADDRESS as `0x${string}`;
export const LIQUIDITY_CONTRACT_DEPLOYED_BLOCK = config.LIQUIDITY_CONTRACT_DEPLOYED_BLOCK;

export const L1_SCROLL_MESSENGER_CONTRACT_ADDRESS =
  config.WITHDRAWAL_CONTRACT_ADDRESS as `0x${string}`;
export const MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS =
  config.MOCK_L2_SCROLL_MESSENGER_CONTRACT_ADDRESS as `0x${string}`;
export const MOCK_L2_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK =
  config.MOCK_L2_SCROLL_MESSENGER_CONTRACT_DEPLOYED_BLOCK;

// transaction
export const TRANSACTION_MAX_RETRIES = 5;
export const WITHDRAWAL_WAIT_TRANSACTION_TIMEOUT = 30_000;
export const INCREMENT_RATE = 0.3;

// message
export const TRANSACTION_ALREADY_EXECUTED = "Message was already successfully executed";

// contract
export const CONTRACT_PAIRS = {
  STAKING: {
    sender: config.CLAIM_CONTRACT_ADDRESS,
    target: config.MINTER_CONTRACT_ADDRESS,
  },
  LIQUIDITY: {
    sender: config.WITHDRAWAL_CONTRACT_ADDRESS,
    target: config.LIQUIDITY_CONTRACT_ADDRESS,
  },
};
