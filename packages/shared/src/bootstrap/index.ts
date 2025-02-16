import { config } from "../config";
import { Discord } from "../lib/discord";

export const bootstrap = (serviceName: string) => {
  if (config.isProduction && config.DISCORD_BOT_TOKEN !== "dummy") {
    const discord = Discord.getInstance(serviceName);
    discord.initialize();
  }
};
