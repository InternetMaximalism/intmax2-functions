import { type Token, fetchTokenList, sleep } from "@intmax2-functions/shared";

export class TokenPrice {
  private static instance: TokenPrice | null = null;
  private interval: NodeJS.Timeout | null = null;
  private readonly FETCH_INTERVAL = 1000 * 60 * 60;
  private tokenPriceList: Token[] = [];

  public static getInstance() {
    if (!TokenPrice.instance) {
      TokenPrice.instance = new TokenPrice();
    }
    return TokenPrice.instance;
  }

  async initialize() {
    await this.fetchAndCacheTokenList();

    this.startScheduler();
  }

  // TODO: FIXME: if the token list is not found ...
  private async fetchAndCacheTokenList() {
    this.tokenPriceList = await fetchTokenList();
  }

  async getTokenPriceList() {
    while (!this.tokenPriceList.length) {
      await sleep(100);
    }

    return this.tokenPriceList;
  }

  cleanup() {
    this.stopScheduler();
    this.tokenPriceList = [];
  }

  private startScheduler() {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(async () => {
      await this.fetchAndCacheTokenList();
    }, this.FETCH_INTERVAL);
  }

  private stopScheduler() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
