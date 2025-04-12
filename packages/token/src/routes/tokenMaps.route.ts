import * as tokenMapsController from "../controllers/tokenMaps.controller";
import { createBaseRouter } from "./utils";

export const tokenMapsRoute = createBaseRouter({
  listHandler: tokenMapsController.list,
});
