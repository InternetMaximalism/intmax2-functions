import { config } from "@intmax2-functions/shared";

export const getProxyMeta = async () => {
  return {
    version: config.BLOCK_BUILDER_VERSION,
    domain: config.PROXY_DOMAIN,
    token: config.PROXY_FRP_TOKEN,
  };
};
