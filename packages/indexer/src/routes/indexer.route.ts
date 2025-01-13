import { Hono } from "hono";
import * as indexerController from "../controllers/indexer.controller";

export const route = new Hono();

route.get("/builders", indexerController.listBlockBuilderNodes);
route.get("/validity-provers", indexerController.listValidityProverNodes);
route.get("/withdrawal-aggregators", indexerController.listWithdrawalAggregatorNodes);
