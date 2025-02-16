import * as tokenMappingsController from "../controllers/tokenMappings.controller";
import { createBaseRouter } from "./utils";

export const tokenMappingsRoute = createBaseRouter({
  listHandler: tokenMappingsController.list,
});
