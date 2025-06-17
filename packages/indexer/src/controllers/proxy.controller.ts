import type { Context } from "hono";
import * as proxyService from "../services/proxy.service";

export const getProxyMeta = async (c: Context) => {
  const result = await proxyService.getProxyMeta();
  return c.json(result);
};
