import { cors } from "hono/cors";
import { config } from "../config";

const getAllowedOrigins = () => {
  const allowedOrigins = config.ALLOWED_ORIGINS;
  const origins = allowedOrigins.split(",").map((origin) => origin.trim());
  return origins.length === 1 && origins[0] === "*" ? "*" : origins;
};

export const corsMiddleware = cors({
  origin: getAllowedOrigins(),
  allowMethods: ["GET", "OPTIONS"] as const,
  allowHeaders: ["Content-Type"] as const,
  maxAge: 7200,
});
