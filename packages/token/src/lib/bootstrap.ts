import { TokenPrice } from "../lib/tokenPrice";

export const bootstrap = () => {
  const tokenPrice = TokenPrice.getInstance();
  tokenPrice.initialize();
};
