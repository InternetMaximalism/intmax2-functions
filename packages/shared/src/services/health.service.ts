import { config } from "../config";

export const healthCheck = () => {
  const params = {
    status: "OK",
    timestamp: new Date().toISOString(),
    application: {
      version: config.SERVICE_VERSION,
    },
  };
  return params;
};
