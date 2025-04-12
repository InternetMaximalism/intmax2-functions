import { CACHE_TIMEOUTS, cacheMiddleware } from "@intmax2-functions/shared";
import { Hono } from "hono";
import * as txMapController from "../controllers/txMap.controller";

export const route = new Hono();

route.use("/*", (c, next) => cacheMiddleware(c, next, CACHE_TIMEOUTS.DETAIL));

route.post("/", txMapController.saveTxMap);
route.get("/:digest", txMapController.getTxMap);
