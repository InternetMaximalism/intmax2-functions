import type { Context } from "hono";
import * as indexerService from "../services/indexer.service";

export const listBlockBuilderNodes = async (c: Context) => {
  const result = await indexerService.listBlockBuilderNodes();
  return c.json(result);
};
