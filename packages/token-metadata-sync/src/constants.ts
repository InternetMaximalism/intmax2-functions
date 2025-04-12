// batch
export const MULTICALL_SIZE = 4096;

// coingecko
export const COIN_GECKO_API_TIMEOUT = 30_000;
export const COIN_MARKET_SLEEP_TIME = 20_000;
export const MARKET_PRICE_PER_PAGE = 250;

// token
export const VS_CURRENCY = "usd";
export const DEFAULT_DECIMALS = 18;
export const ETHEREUM_TOKEN = {
  id: "ethereum",
  symbol: "eth",
  name: "Ethereum",
  contractAddress: "0x0000000000000000000000000000000000000000",
  decimals: DEFAULT_DECIMALS,
  image: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
};
