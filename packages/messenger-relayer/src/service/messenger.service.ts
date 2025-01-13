import { config, sleep } from "@intmax2-functions/shared";
import axios from "axios";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SLEEP_TIME,
  SCROLL_API_BRIDGE_URL,
  SUCCESS_CODE,
} from "../constants";
import type { ScrollMessengerResponse, ScrollMessengerResult } from "../types";

export const fetchAllClaimableScrollMessengerResults = async () => {
  const allResults: ScrollMessengerResult[] = [];
  let currentPage = DEFAULT_PAGE;
  let hasMore = true;

  const contractAddress = config.STAKING_RELAYER_ENABLED
    ? config.CLAIM_CONTRACT_ADDRESS
    : config.WITHDRAWAL_CONTRACT_ADDRESS;

  while (hasMore) {
    const res = await axios.get<ScrollMessengerResponse>(
      `${SCROLL_API_BRIDGE_URL[config.NETWORK_ENVIRONMENT]}?page_size=${DEFAULT_PAGE_SIZE}&page=${currentPage}&address=${contractAddress}`,
    );
    if (res.data.errcode !== SUCCESS_CODE) {
      throw new Error(`Failed to fetch claimable requests: ${res.data.errmsg}`);
    }

    const { results, total } = res.data.data;

    if (total === 0) {
      return [];
    }

    allResults.push(...results);

    const totalPage = Math.ceil(total / DEFAULT_PAGE_SIZE);
    hasMore = currentPage < totalPage;
    currentPage++;

    await sleep(DEFAULT_SLEEP_TIME);
  }

  const messengerResults = allResults.filter(
    (result) => result.claim_info && result.claim_info.claimable,
  );

  return messengerResults;
};
