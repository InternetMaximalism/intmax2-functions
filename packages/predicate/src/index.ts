import { serve } from "@hono/node-server";
import {
  APP_TIMEOUT,
  NotFoundError,
  config,
  handleError,
  limiter,
  logger,
  loggingMiddleware,
  requestMiddleware,
} from "@intmax2-functions/shared";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { name } from "../package.json";
import { routes } from "./routes";

const { PORT: port } = config;

const app = new Hono();

app.use(limiter);
app.use(secureHeaders());
app.use(prettyJSON());
app.use(timeout(APP_TIMEOUT));

app.use(requestMiddleware);
app.use(loggingMiddleware);

app.notFound(() => {
  throw new NotFoundError();
});

app.onError(handleError);

routes.forEach(({ path, route }) => {
  app.route(path, route);
});

logger.info("%s server is running on port %d", name.toLocaleUpperCase(), port);

serve({
  fetch: app.fetch,
  port,
});
