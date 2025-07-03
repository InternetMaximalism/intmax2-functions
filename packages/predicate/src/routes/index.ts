import { BASE_PATH, healthRoute } from "@intmax2-function/shared";
import { route as predicateRoute } from "./predicate.route";

export const routes = [
  {
    path: `${BASE_PATH}/health`,
    route: healthRoute,
  },
  {
    path: `${BASE_PATH}/predicate`,
    route: predicateRoute,
  },
];
