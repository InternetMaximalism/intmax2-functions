export type TokenMappingData = {
  tokenIndex: number;
  contractAddress: string;
  symbol: string;
  decimals: number;
};

export interface TokenMappingFilters {
  tokenIndexes?: string[];
}
