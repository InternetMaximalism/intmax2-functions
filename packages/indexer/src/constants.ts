import { config } from "@intmax2-functions/shared";

export const BLOCK_BUILDER_ALLOWLIST = ((config.BLOCK_BUILDER_ALLOWLIST as string[]) ?? []).map(
  (address) => address.toLowerCase(),
);
export const ALLOWLIST_BLOCK_BUILDER_POSSIBILITIES = config.ALLOWLIST_BLOCK_BUILDER_POSSIBILITIES;
export const BLOCK_BUILDER_INDEXER_COUNT = config.BLOCK_BUILDER_INDEXER_COUNT;
export const BLOCK_BUILDER_MIN_ALLOWLIST_COUNT = config.BLOCK_BUILDER_MIN_ALLOWLIST_COUNT;
