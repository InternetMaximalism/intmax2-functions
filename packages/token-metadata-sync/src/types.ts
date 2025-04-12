export type TokenData = {
  id: string;
  symbol: string;
  name: string;
  platforms: {
    ethereum: string;
  };
  contractAddress?: string;
  decimals?: number;
};

export type MarketDataWithDecimals = {
  id: string;
  symbol: string;
  price: number;
  contractAddress: string;
  decimals: number;
  image: string | undefined;
};
