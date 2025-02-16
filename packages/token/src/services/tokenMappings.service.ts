import {
  DEFAULT_IMAGE_PATH,
  TokenMapping,
  type TokenMappingData,
  type TokenPaginationValidationType,
} from "@intmax2-functions/shared";
import { DEFAULT_PAGE_SIZE } from "../constants";
import { TokenPrice } from "../lib/tokenPrice";
import { calculatePaginationIndices, getNextCursor } from "../lib/utils";

export const list = async (
  tokenIndexes: string[] = [],
  paginationOptions: TokenPaginationValidationType = {},
) => {
  const tokenMappings = await fetchTokenMappings(tokenIndexes);

  if (Object.keys(paginationOptions).length === 0) {
    return {
      items: await formatTokenMappings(tokenMappings),
      nextCursor: null,
      total: tokenMappings.length,
    };
  }

  const perPage = paginationOptions.perPage || DEFAULT_PAGE_SIZE;
  const { startIndex, endIndex } = calculatePaginationIndices(
    tokenMappings,
    paginationOptions.cursor,
    perPage,
  );
  const items = tokenMappings.slice(startIndex, endIndex);
  const nextCursor = getNextCursor(items, tokenMappings.length, startIndex, perPage);

  return {
    items: await formatTokenMappings(items),
    nextCursor,
    total: tokenMappings.length,
  };
};

const fetchTokenMappings = async (tokenIndexes: string[]) => {
  const tokenMapping = TokenMapping.getInstance();
  const tokenMappings = tokenIndexes.length
    ? await tokenMapping.fetchTokenMappings({ tokenIndexes })
    : await tokenMapping.fetchAllTokenMappings();

  return tokenMappings;
};

const formatTokenMappings = async (tokenMappings: TokenMappingData[]) => {
  const tokenPrice = TokenPrice.getInstance();
  const tokenPriceList = await tokenPrice.getTokenPriceList();

  return tokenMappings.map((mapping) => {
    const priceData = tokenPriceList.find(
      (item) => item.contractAddress === mapping.contractAddress,
    );
    return {
      ...mapping,
      price: priceData?.price ?? 0,
      image: priceData?.image ?? DEFAULT_IMAGE_PATH,
    };
  });
};
