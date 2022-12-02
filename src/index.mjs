import "dotenv/config";

import { ActivityType } from "discord.js";
import { BotClient } from "./structures/BotClient.mjs";
import { activity } from "./config.mjs";

const client = new BotClient({
  shards: "auto",
  allowedMentions: {
    parse: [],
    users: [],
    roles: [],
    repliedUser: false,
  },
  presence: {
    activities: [activity],
  },
});

client.init();
