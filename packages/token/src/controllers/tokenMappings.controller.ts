import { tokenIndexesValidation, tokenPaginationValidation } from "@intmax2-functions/shared";
import type { Context } from "hono";
import { extractQueriesParams, extractQueryParams } from "../lib/query";
import * as tokenMappingsService from "../services/tokenMappings.service";

export const list = async (c: Context) => {
  const queries = extractQueryParams(c.req.queries());
  const { tokenIndexes } = await tokenIndexesValidation.parseAsync(queries);

  const query = extractQueriesParams(c.req.query());
  const paginationOptions = await tokenPaginationValidation.parseAsync(query);

  const result = await tokenMappingsService.list(tokenIndexes, paginationOptions);
  return c.json(result);
};
