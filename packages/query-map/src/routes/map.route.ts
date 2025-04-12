import { CACHE_TIMEOUTS, cacheMiddleware } from "@intmax2-functions/shared";
import { Hono } from "hono";
import * as mapController from "../controllers/map.controller";

export const route = new Hono();

route.use("/query-map/*", (c, next) => cacheMiddleware(c, next, CACHE_TIMEOUTS.DETAIL));

route.post("/query-map", mapController.saveQueryMap);
route.get("/query-map/:key", mapController.getQueryMap);
