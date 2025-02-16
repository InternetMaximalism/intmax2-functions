import { config } from "../config";
import { FILE_PATHS } from "../constants";
import type { Token } from "../types";
import { downloadData } from "./cloudStorage";
import { logger } from "./logger";

export const fetchTokenList = async () => {
  try {
    const res = await downloadData(config.GOOGLE_STORE_BUCKET, FILE_PATHS.tokenPrices);
    const tokenList = JSON.parse(res) as Token[];
    return tokenList;
  } catch {
    logger.warn("Token list not found");
    return [];
  }
};
