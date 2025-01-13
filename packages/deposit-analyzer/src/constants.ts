import { config } from "@intmax2-functions/shared";

// batch
export const SUMMARY_BATCH_SIZE = 250;

// blockchain
export const LIQUIDITY_CONTRACT_ADDRESS = config.LIQUIDITY_CONTRACT_ADDRESS as `0x${string}`;
export const LIQUIDITY_CONTRACT_DEPLOYED_BLOCK = config.LIQUIDITY_CONTRACT_DEPLOYED_BLOCK;
export const TRANSACTION_MAX_RETRIES = 3;

// gasLimit
export const GAS_CONFIG = {
  baseGas: 220000,
  perDepositGas: 20000,
  bufferGas: 100000,
} as const;

// transaction
export const FIXED_DEPOSIT_VALUE = "0.1";
