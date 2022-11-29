import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "fs";
import Enmap from "enmap";
import { importFile } from "../utils/functions.mjs";
import { guildId } from "../config.mjs";
import { Player } from "discord-player";

export class BotClient extends Client {
  /** @type {import("discord.js").Collection<string, import("../utils/types.mjs").Command>} */
  commands = new Collection();

  db = new Enmap({
    name: "db",
    dataDir: "./db",
  });

  /** @type {import("../utils/types.mjs").EnvConfig} */
  env = {
    token: process.env.TOKEN,
    prefix: process.env.PREFIX,
  };

  player = new Player(this);

  /** @param {import('discord.js').ClientOptions} options */
  constructor(options = {}) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
      ],
      ...options,
    });
  }

  async init() {
    await this.ensureEnv();
    await this.registerCommands();
    await this.registerEvents();
    await this.registerFeatures();
    this.login(process.env.TOKEN);
  }

  async ensureEnv() {
    if (this.env.token?.length < 10)
      throw new SyntaxError("No valid token provided.");
    if (!this.env.prefix?.length) this.env.prefix = "!";
  }

  async registerCommands() {
    /** @type {ApplicationCommandDataResolvable[]} */
    const commands = [];
    fs.readdirSync("./src/commands").forEach(async (dir) => {
      const commandFiles = fs
        .readdirSync(`./src/commands/${dir}`)
        .filter((file) => file.endsWith("js"));

      for (const file of commandFiles) {
        const command = await importFile(`../commands/${dir}/${file}`);
        if (!command?.data || !command?.run) continue;

        this.commands.set(command.data.toJSON().name, command);
        commands.push(command.data.toJSON());
      }
    });

    this.on("ready", async () => {
      if (guildId?.length) {
        const guild = await this.guilds.cache.get(guildId);
        if (!guild) return;
        await guild.commands.set(commands);
      } else {
        await this.application?.commands.set(commands);
      }
    });
  }

  async registerEvents() {
    const eventFiles = fs
      .readdirSync("./src/events")
      .filter((file) => file.endsWith("js"));

    for (const file of eventFiles) {
      const event = await importFile(`../events/${file}`);
      const eventName = file.split(".")[0];
      this.on(eventName, event.bind(null, this));
    }
  }

  async registerFeatures() {
    const files = fs
      .readdirSync("./src/features")
      .filter((file) => file.endsWith("js"));
    for (const file of files) {
      const feature = await importFile(`../features/${file}`);
      feature(this);
    }
  }
}
