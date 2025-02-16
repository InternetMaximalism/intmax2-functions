import { Discord } from "@intmax2-functions/shared";
import {
  compareBlockNumbers,
  fetchLatestRollupBlockNumber,
  fetchLatestValidityProverBlockNumber,
} from "./observer.service";

export const performJob = async () => {
  const [validityProverBlockNumber, rollupBlockNumber] = await Promise.all([
    fetchLatestValidityProverBlockNumber(),
    fetchLatestRollupBlockNumber(),
  ]);

  const { isValid, message } = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

  if (!isValid) {
    const discord = Discord.getInstance();
    await discord.sendMessage("WARN", message);
  }
};
