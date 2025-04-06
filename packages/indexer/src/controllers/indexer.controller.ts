import type { Context } from "hono";
import * as indexerService from "../services/indexer.service";

export const listBlockBuilderNodes = async (c: Context) => {
  const result = await indexerService.listBlockBuilderNodes();
  return c.json(result);
};

export const getBlockBuilderMeta = async (c: Context) => {
  const result = await indexerService.getBlockBuilderMeta();
  return c.json(result);
};
