import { config } from "@intmax2-function/shared";

export const BLOCK_BUILDER_ALLOWLIST = ((config.BLOCK_BUILDER_ALLOWLIST as string[]) ?? []).map(
  (address) => address.toLowerCase(),
);
export const ALLOWLIST_BLOCK_BUILDER_POSSIBILITIES = config.ALLOWLIST_BLOCK_BUILDER_POSSIBILITIES;
export const BLOCK_BUILDER_INDEXER_COUNT = config.BLOCK_BUILDER_INDEXER_COUNT;
export const BLOCK_BUILDER_MIN_ALLOWLIST_COUNT = config.BLOCK_BUILDER_MIN_ALLOWLIST_COUNT;

export enum BuilderSelectionMode {
  ALLOWLIST_ONLY = "ALLOWLIST_ONLY",
  ALLOWLIST_PRIORITY = "ALLOWLIST_PRIORITY",
  GUARANTEED_ALLOWLIST = "GUARANTEED_ALLOWLIST",
  RANDOM = "RANDOM",
}

export const BUILDER_SELECTION_MODE =
  (process.env.BUILDER_SELECTION_MODE as BuilderSelectionMode) ||
  BuilderSelectionMode.GUARANTEED_ALLOWLIST;
