import { Hono } from "hono";
import * as predicateController from "../controllers/predicate.controller";

export const route = new Hono();

route.post("/evaluate-policy", predicateController.fetchPredicateSignatures);
