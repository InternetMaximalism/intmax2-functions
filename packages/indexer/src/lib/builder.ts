import { IndexerInfo } from "@intmax2-functions/shared";
import {
  ALLOWLIST_BLOCK_BUILDER_POSSIBILITIES,
  BLOCK_BUILDER_ALLOWLIST,
  BLOCK_BUILDER_COUNT,
} from "../constants";

export const getRandomBuilderWithAllowlistPriority = async (activeBuilders: IndexerInfo[]) => {
  const allowlistedBuilders = activeBuilders.filter((builder) =>
    BLOCK_BUILDER_ALLOWLIST.includes(builder.address),
  );
  const otherBuilders = activeBuilders.filter(
    (builder) => !BLOCK_BUILDER_ALLOWLIST.includes(builder.address),
  );

  if (Math.random() < ALLOWLIST_BLOCK_BUILDER_POSSIBILITIES && allowlistedBuilders.length > 0) {
    const randomBuilder =
      allowlistedBuilders[Math.floor(Math.random() * allowlistedBuilders.length)];
    return [randomBuilder];
  } else if (otherBuilders.length > 0) {
    const randomBuilder = otherBuilders[Math.floor(Math.random() * otherBuilders.length)];
    return [randomBuilder];
  }

  const randomBuilder = allowlistedBuilders[Math.floor(Math.random() * allowlistedBuilders.length)];
  return [randomBuilder];
};

export const getRandomBuilders = async (activeBuilders: IndexerInfo[]) => {
  if (activeBuilders.length <= BLOCK_BUILDER_COUNT) {
    return [...activeBuilders];
  }

  const selectedBuilders: IndexerInfo[] = [];

  for (let i = 0; i < BLOCK_BUILDER_COUNT; i++) {
    const randomIndex = Math.floor(Math.random() * activeBuilders.length);
    selectedBuilders.push(activeBuilders[randomIndex]);
    activeBuilders.splice(randomIndex, 1);
  }

  return selectedBuilders;
};
