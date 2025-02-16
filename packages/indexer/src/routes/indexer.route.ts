import { Hono } from "hono";
import * as indexerController from "../controllers/indexer.controller";

export const route = new Hono();

route.get("/builders", indexerController.listBlockBuilderNodes);
