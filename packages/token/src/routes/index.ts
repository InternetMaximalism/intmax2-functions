import { BASE_PATH, healthRoute } from "@intmax2-functions/shared";
import { tokenMapsRoute } from "./tokenMaps.route";
import { tokenPricesRoute } from "./tokenPrices.route";

export const routes = [
  {
    path: `${BASE_PATH}/health`,
    route: healthRoute,
  },
  {
    path: `${BASE_PATH}/token-prices`,
    route: tokenPricesRoute,
  },
  {
    path: `${BASE_PATH}/token-maps`,
    route: tokenMapsRoute,
  },
];
