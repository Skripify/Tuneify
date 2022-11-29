import "dotenv/config";

import { ActivityType } from "discord.js";
import { BotClient } from "./structures/BotClient.mjs";

const client = new BotClient({
  allowedMentions: {
    parse: [],
    users: [],
    roles: [],
    repliedUser: false,
  },
  presence: {
    activities: [
      {
        name: "your jams",
        type: ActivityType.Listening,
      },
    ],
  },
});

client.init();
