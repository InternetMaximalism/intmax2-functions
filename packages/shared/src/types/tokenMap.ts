export type TokenMapData = {
  tokenIndex: number;
  contractAddress: string;
  symbol: string;
  decimals: number;
};

export interface TokenMapFilter {
  tokenIndexes?: string[];
}
