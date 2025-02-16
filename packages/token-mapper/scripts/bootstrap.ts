import { TokenMapping, type TokenMappingData, logger } from "@intmax2-functions/shared";

const data: TokenMappingData[] = [
  {
    tokenIndex: 0,
    symbol: "ETH",
    decimals: 18,
    contractAddress: "0x0000000000000000000000000000000000000000",
  },
];

const bootstrap = async () => {
  const tokenMapping = new TokenMapping();
  await tokenMapping.addTokenMappingsBatch(data);
  logger.info(`Token mappings added successfully`);
};
bootstrap();
