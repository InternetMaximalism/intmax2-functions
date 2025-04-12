import { getQueryMapValidation, saveQueryMapValidation } from "@intmax2-functions/shared";
import type { Context } from "hono";
import * as mapService from "../services/map.service";

// NOTE: ID duplicate
export const saveQueryMap = async (c: Context) => {
  const body = await c.req.json();
  const parsed = await saveQueryMapValidation.parseAsync(body);
  const result = await mapService.saveQueryMap(parsed);
  return c.json(result);
};

export const getQueryMap = async (c: Context) => {
  const params = c.req.param();
  const parsed = await getQueryMapValidation.parseAsync(params);
  const result = await mapService.getQueryMap(parsed.key);
  return c.json(result);
};
