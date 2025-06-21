import {
  MINT_AVAILABLE_FROM,
  MINT_INTERVAL_WEEKS,
  type MintEventData,
  TRANSFER_INTERVAL_WEEKS,
  logger,
} from "@intmax2-functions/shared";

export const shouldExecuteMint = (now: number, mintEvent: MintEventData | null) => {
  const INTERVAL_WEEKS_MS = MINT_INTERVAL_WEEKS * 7 * 24 * 60 * 60 * 1000;

  if (!mintEvent) {
    const shouldExecute = now >= new Date(MINT_AVAILABLE_FROM).getTime();
    logger.info(`No last mint time found, should execute mint check: ${shouldExecute}`);
    return shouldExecute;
  }

  const lastMintTime = mintEvent.createdAt.toDate().getTime();
  return now - lastMintTime >= INTERVAL_WEEKS_MS;
};

export const shouldExecuteTransfer = (now: number, mintEvent: MintEventData | null) => {
  const INTERVAL_WEEKS_MS = TRANSFER_INTERVAL_WEEKS * 24 * 60 * 60 * 1000;

  if (!mintEvent) {
    const shouldExecute = now >= new Date(MINT_AVAILABLE_FROM).getTime();
    logger.info(`No last transfer time found, should execute transfer check: ${shouldExecute}`);
    return shouldExecute;
  }

  const lastTransferTime = mintEvent.createdAt.toDate().getTime();
  return now - lastTransferTime >= INTERVAL_WEEKS_MS;
};
