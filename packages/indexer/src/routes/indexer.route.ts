import { CACHE_TIMEOUTS, cacheMiddleware } from "@intmax2-functions/shared";
import { Hono } from "hono";
import * as indexerController from "../controllers/indexer.controller";

export const route = new Hono();

route.use("/builders/meta", (c, next) => cacheMiddleware(c, next, CACHE_TIMEOUTS.DETAIL));

route.get("/builders", indexerController.listBlockBuilderNodes);
route.get("/builders/meta", indexerController.getBlockBuilderMeta);
