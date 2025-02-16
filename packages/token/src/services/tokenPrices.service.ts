import type { Token, TokenPaginationValidationType } from "@intmax2-functions/shared";
import { DEFAULT_PAGE_SIZE } from "../constants";
import { TokenPrice } from "../lib/tokenPrice";
import { calculatePaginationIndices, getNextCursor } from "../lib/utils";

export const list = async (
  contractAddresses: string[] = [],
  paginationOptions: TokenPaginationValidationType = {},
) => {
  const tokenPrice = TokenPrice.getInstance();
  const tokenPriceList = await tokenPrice.getTokenPriceList();
  const filteredList = filterTokensByAddresses(tokenPriceList, contractAddresses);

  if (Object.keys(paginationOptions).length === 0) {
    return {
      items: filteredList,
      nextCursor: null,
      total: filteredList.length,
    };
  }

  const perPage = paginationOptions.perPage || DEFAULT_PAGE_SIZE;
  const { startIndex, endIndex } = calculatePaginationIndices(
    filteredList,
    paginationOptions.cursor,
    perPage,
  );

  const items = filteredList.slice(startIndex, endIndex);
  const nextCursor = getNextCursor(items, filteredList.length, startIndex, perPage);

  return {
    items,
    nextCursor,
    total: filteredList.length,
  };
};

const filterTokensByAddresses = (tokenList: Token[], contractAddresses: string[]) => {
  if (contractAddresses.length === 0) {
    return tokenList;
  }
  return tokenList.filter((token) => contractAddresses.includes(token.contractAddress));
};
