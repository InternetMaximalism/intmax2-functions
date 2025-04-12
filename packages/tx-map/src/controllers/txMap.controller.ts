import { getTxMapValidation, saveTxMapValidation } from "@intmax2-functions/shared";
import type { Context } from "hono";
import * as txMapService from "../services/txMap.service";

export const saveTxMap = async (c: Context) => {
  const body = await c.req.json();
  const parsed = await saveTxMapValidation.parseAsync(body);
  const result = await txMapService.saveTxMap(parsed);
  return c.json(result);
};

export const getTxMap = async (c: Context) => {
  const params = c.req.param();
  const parsed = await getTxMapValidation.parseAsync(params);
  const result = await txMapService.getTxMap(parsed.digest);
  return c.json(result);
};
