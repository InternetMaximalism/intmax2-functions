import * as tokenPricesController from "../controllers/tokenPrices.controller";
import { createBaseRouter } from "./utils";

export const tokenPricesRoute = createBaseRouter({
  listHandler: tokenPricesController.list,
});
