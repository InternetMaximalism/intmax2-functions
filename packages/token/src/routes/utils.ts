import { CACHE_TIMEOUTS, cacheMiddleware } from "@intmax2-functions/shared";
import { type Context, Hono } from "hono";
import { etag } from "hono/etag";

interface RouterConfig {
  listHandler: (c: Context) => Promise<any>;
}

export const createBaseRouter = (config: RouterConfig): Hono => {
  const router = new Hono();

  router.use("*", etag());
  router.use("*", (c, next) => cacheMiddleware(c, next, CACHE_TIMEOUTS.LIST));

  router.get("/list", config.listHandler);

  return router;
};
