import {
  DEFAULT_IMAGE_PATH,
  TokenMap,
  type TokenMapData,
  type TokenPaginationValidationType,
} from "@intmax2-functions/shared";
import { DEFAULT_PAGE_SIZE } from "../constants";
import { TokenPrice } from "../lib/tokenPrice";
import { calculatePaginationIndices, getNextCursor } from "../lib/utils";

export const list = async (
  tokenIndexes: string[] = [],
  paginationOptions: TokenPaginationValidationType = {},
) => {
  const tokenMaps = await fetchTokenMaps(tokenIndexes);

  if (Object.keys(paginationOptions).length === 0) {
    return {
      items: await formatTokenMaps(tokenMaps),
      nextCursor: null,
      total: tokenMaps.length,
    };
  }

  const perPage = paginationOptions.perPage || DEFAULT_PAGE_SIZE;
  const { startIndex, endIndex } = calculatePaginationIndices(
    tokenMaps,
    paginationOptions.cursor,
    perPage,
  );
  const items = tokenMaps.slice(startIndex, endIndex);
  const nextCursor = getNextCursor(items, tokenMaps.length, startIndex, perPage);

  return {
    items: await formatTokenMaps(items),
    nextCursor,
    total: tokenMaps.length,
  };
};

const fetchTokenMaps = async (tokenIndexes: string[]) => {
  const tokenMap = TokenMap.getInstance();
  const tokenMaps = tokenIndexes.length
    ? await tokenMap.fetchTokenMaps({ tokenIndexes })
    : await tokenMap.fetchAllTokenMaps();

  return tokenMaps;
};

const formatTokenMaps = async (tokenMaps: TokenMapData[]) => {
  const tokenPrice = TokenPrice.getInstance();
  const tokenPriceList = await tokenPrice.getTokenPriceList();

  return tokenMaps.map((map) => {
    const priceData = tokenPriceList.find((item) => item.contractAddress === map.contractAddress);
    return {
      ...map,
      price: priceData?.price ?? 0,
      image: priceData?.image ?? DEFAULT_IMAGE_PATH,
    };
  });
};
