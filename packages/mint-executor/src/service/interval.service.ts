import {
  MINT_AVAILABLE_FROM,
  MINT_INTERVAL_WEEKS,
  type MintEventData,
  TRANSFER_INTERVAL_WEEKS,
  logger,
} from "@intmax2-functions/shared";

export const shouldExecuteMint = (now: number, mintEvent: MintEventData | null) => {
  const INTERVAL_WEEKS_MS = MINT_INTERVAL_WEEKS * 24 * 60 * 60 * 1000;

  if (!mintEvent) {
    const shouldExecute = now >= new Date(MINT_AVAILABLE_FROM).getTime();
    logger.info(`No last mint time found, should execute mint check: ${shouldExecute}`);
    return shouldExecute;
  }

  const nowDate = new Date(now);
  const lastMintDate = new Date(mintEvent.createdAt.toDate());

  nowDate.setHours(0, 0, 0, 0);
  lastMintDate.setHours(0, 0, 0, 0);

  const targetDate = new Date(lastMintDate.getTime() + INTERVAL_WEEKS_MS);

  return nowDate.getTime() >= targetDate.getTime();
};

export const shouldExecuteTransfer = (now: number, mintEvent: MintEventData | null) => {
  const INTERVAL_WEEKS_MS = TRANSFER_INTERVAL_WEEKS * 24 * 60 * 60 * 1000;

  if (!mintEvent) {
    const shouldExecute = now >= new Date(MINT_AVAILABLE_FROM).getTime();
    logger.info(`No last transfer time found, should execute transfer check: ${shouldExecute}`);
    return shouldExecute;
  }

  const nowDate = new Date(now);
  const lastTransferDate = new Date(mintEvent.createdAt.toDate());

  nowDate.setHours(0, 0, 0, 0);
  lastTransferDate.setHours(0, 0, 0, 0);

  const targetDate = new Date(lastTransferDate.getTime() + INTERVAL_WEEKS_MS);

  return nowDate.getTime() >= targetDate.getTime();
};
