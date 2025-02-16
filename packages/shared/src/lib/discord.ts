import { Client, GatewayIntentBits, type TextChannel } from "discord.js";
import { config } from "../config";
import { logger } from "./logger";

export class Discord {
  private static instance: Discord | null = null;
  private readonly client: Client;
  private readonly serviceName: string;

  private constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
  }

  public static getInstance(serviceName: string = "Default Service") {
    if (!Discord.instance) {
      Discord.instance = new Discord(serviceName);
    }
    return Discord.instance;
  }

  initialize() {
    this.client.login(config.DISCORD_BOT_TOKEN);
    this.client.once("ready", async () => {
      logger.debug(`Logged in as ${this.client?.user?.tag}!`);
    });
  }

  async sendMessage(messageType: "INFO" | "WARN" | "FATAL", message: string) {
    if (config.isDevelopment) {
      logger.info(`[${messageType}] ${this.serviceName} ${message}`);
      return;
    }

    try {
      const channelId = this.getChannelIDByMessageType(messageType);
      const channel = (await this.client.channels.fetch(channelId)) as TextChannel;
      await channel
        .send(`[${messageType}] ${this.serviceName} ${message}`)
        .then((message) => logger.info(`Sent message: ${message.content}`))
        .catch(logger.error);
    } catch (error) {
      logger.error(error);
    }
  }

  async sendMessageWitForReady(messageType: "INFO" | "WARN" | "FATAL", message: string) {
    if (config.isDevelopment) {
      return await this.sendMessage(messageType, message);
    }

    while (!this.client.isReady()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await this.sendMessage(messageType, message);
  }

  private getChannelIDByMessageType(type: "INFO" | "WARN" | "FATAL") {
    return type === "FATAL"
      ? config.DISCORD_BOT_ERROR_CHANNEL_ID
      : config.DISCORD_BOT_INFO_CHANNEL_ID;
  }
}
