import { BASE_PATH, healthRoute } from "@intmax2-functions/shared";
import { route as indexerRoute } from "./indexer.route";

export const routes = [
  {
    path: `${BASE_PATH}/health`,
    route: healthRoute,
  },
  {
    path: `${BASE_PATH}/indexer`,
    route: indexerRoute,
  },
];
