import { randomInt } from "node:crypto";
import { IndexerInfo } from "@intmax2-function/shared";
import {
  ALLOWLIST_BLOCK_BUILDER_POSSIBILITIES,
  BLOCK_BUILDER_ALLOWLIST,
  BLOCK_BUILDER_INDEXER_COUNT,
  BLOCK_BUILDER_MIN_ALLOWLIST_COUNT,
  BUILDER_SELECTION_MODE,
  BuilderSelectionMode,
} from "../constants";
import { shuffleArray } from "./array";

export const getBuildersByMode = async (
  activeBuilders: IndexerInfo[],
  mode?: BuilderSelectionMode,
): Promise<IndexerInfo[]> => {
  const selectionMode = mode || BUILDER_SELECTION_MODE;

  switch (selectionMode) {
    case BuilderSelectionMode.ALLOWLIST_ONLY:
      return getRandomBuildersWithOnlyAllowlist(activeBuilders);
    case BuilderSelectionMode.ALLOWLIST_PRIORITY:
      return getRandomBuilderWithAllowlistPriority(activeBuilders);
    case BuilderSelectionMode.GUARANTEED_ALLOWLIST:
      return getRandomBuildersWithGuaranteedAllowlist(activeBuilders);
    case BuilderSelectionMode.RANDOM:
      return getRandomBuilders(activeBuilders);
    default:
      return getRandomBuildersWithGuaranteedAllowlist(activeBuilders);
  }
};

export const getRandomBuildersWithOnlyAllowlist = async (
  activeBuilders: IndexerInfo[],
): Promise<IndexerInfo[]> => {
  const allowlistedBuilders = activeBuilders.filter((builder) =>
    BLOCK_BUILDER_ALLOWLIST.includes(builder.address),
  );
  if (allowlistedBuilders.length === 0) {
    return [];
  }

  for (let i = allowlistedBuilders.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [allowlistedBuilders[i], allowlistedBuilders[j]] = [
      allowlistedBuilders[j],
      allowlistedBuilders[i],
    ];
  }

  return allowlistedBuilders.slice(0, BLOCK_BUILDER_INDEXER_COUNT);
};

export const getRandomBuilderWithAllowlistPriority = async (activeBuilders: IndexerInfo[]) => {
  const allowlistedBuilders = activeBuilders.filter((builder) =>
    BLOCK_BUILDER_ALLOWLIST.includes(builder.address),
  );
  const otherBuilders = activeBuilders.filter(
    (builder) => !BLOCK_BUILDER_ALLOWLIST.includes(builder.address),
  );

  const randomValue = randomInt(0, 1000000) / 1000000;
  if (randomValue < ALLOWLIST_BLOCK_BUILDER_POSSIBILITIES && allowlistedBuilders.length > 0) {
    const randomBuilder = allowlistedBuilders[randomInt(0, allowlistedBuilders.length)];
    return [randomBuilder];
  } else if (otherBuilders.length > 0) {
    const randomBuilder = otherBuilders[randomInt(0, otherBuilders.length)];
    return [randomBuilder];
  }
  const randomBuilder = allowlistedBuilders[randomInt(0, allowlistedBuilders.length)];
  return [randomBuilder];
};

export const getRandomBuildersWithGuaranteedAllowlist = async (
  activeBuilders: IndexerInfo[],
): Promise<IndexerInfo[]> => {
  if (activeBuilders.length === 0) return [];

  const allowlisted = shuffleArray(
    activeBuilders.filter((builder) => BLOCK_BUILDER_ALLOWLIST.includes(builder.address)),
  );
  const others = shuffleArray(
    activeBuilders.filter((builder) => !BLOCK_BUILDER_ALLOWLIST.includes(builder.address)),
  );

  const selected = [];

  selected.push(
    ...allowlisted.slice(0, Math.min(BLOCK_BUILDER_MIN_ALLOWLIST_COUNT, allowlisted.length)),
  );

  const remaining = BLOCK_BUILDER_INDEXER_COUNT - selected.length;
  const allRemaining = [...allowlisted.slice(selected.length), ...others];
  selected.push(...shuffleArray(allRemaining).slice(0, remaining));

  return shuffleArray(selected);
};

export const getRandomBuilders = async (activeBuilders: IndexerInfo[]): Promise<IndexerInfo[]> => {
  if (activeBuilders.length <= BLOCK_BUILDER_INDEXER_COUNT) {
    const shuffled = [...activeBuilders];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const shuffled = [...activeBuilders];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, BLOCK_BUILDER_INDEXER_COUNT);
};
