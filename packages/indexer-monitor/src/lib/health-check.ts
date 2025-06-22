import { logger } from "@intmax2-functions/shared";
import axios from "axios";
import { API_TIMEOUT } from "../constants";
import type { BuilderHealthCheckResponse } from "../types";

export const requestHealthCheck = async (url: string, maxRetries = 3, retryDelay = 1000) => {
  let lastError: Error | null = null;

  // TODO: fee info
  // TODO: version info(required version)
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get<BuilderHealthCheckResponse>(`${url}/health-check`, {
        timeout: API_TIMEOUT,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.data?.name === undefined) {
        throw new Error("Name is missing in the health check response");
      }

      logger.debug(
        `Health check successful for ${url}: ${response.data.name} (v${response.data.version})`,
      );

      return response.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(`Health check failed for ${url}: ${lastError.message}`);

      if (attempt < maxRetries) {
        logger.warn(
          `Retrying health check for ${url} in ${retryDelay}ms (attempt ${attempt}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError || new Error(`Health check failed after ${maxRetries} attempts`);
};
