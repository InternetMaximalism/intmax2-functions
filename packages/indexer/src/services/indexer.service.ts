import { config } from "@intmax2-functions/shared";

const getBlockBuilders = () => {
  return [
    {
      fee: 0.041,
      speed: 3,
      url: config.BLOCK_BUILDER_URL,
    },
  ];
};

export const listBlockBuilderNodes = async () => {
  return getBlockBuilders();
};
