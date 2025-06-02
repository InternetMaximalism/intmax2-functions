// scroll api
export const SCROLL_API_BRIDGE_URL_MAPS = {
  mainnet: "https://mainnet-api-bridge-v2.scroll.io/api/l2/unclaimed/withdrawals",
  sepolia: "https://sepolia-api-bridge-v2.scroll.io/api/l2/unclaimed/withdrawals",
};
export const SUCCESS_CODE = 0;
export const SCROLL_API_IO_ERROR_MESSAGE = "i/o timeout";

export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;
export const DEFAULT_SLEEP_TIME = 1000;

// batch
export const MAX_RELAYER_BATCH_SIZE = 100;
export const RELAYER_FIXED_GAS_LIMIT = 4400000n;
