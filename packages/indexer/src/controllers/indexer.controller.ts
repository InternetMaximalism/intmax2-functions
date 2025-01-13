import type { Context } from "hono";
import * as indexerService from "../services/indexer.service";

export const listBlockBuilderNodes = async (c: Context) => {
  const result = await indexerService.listBlockBuilderNodes();
  return c.json(result);
};

export const listValidityProverNodes = async (c: Context) => {
  const result = await indexerService.listValidityProverNodes();
  return c.json(result);
};

export const listWithdrawalAggregatorNodes = async (c: Context) => {
  const result = await indexerService.listWithdrawalAggregatorNodes();
  return c.json(result);
};
