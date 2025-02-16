import type { QueryParams } from "../types";

export const extractQueryParams = (query: QueryParams) => {
  const { perPage, cursor, ...rest } = query;
  return rest;
};

export const extractQueriesParams = (query: QueryParams) => {
  const { contractAddresses, tokenIndexes, ...rest } = query;
  return rest;
};
