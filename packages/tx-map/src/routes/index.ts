import { BASE_PATH, healthRoute } from "@intmax2-functions/shared";
import { route as mapRoute } from "./txMap.route";

export const routes = [
  {
    path: `${BASE_PATH}/health`,
    route: healthRoute,
  },
  {
    path: `${BASE_PATH}/map`,
    route: mapRoute,
  },
];
