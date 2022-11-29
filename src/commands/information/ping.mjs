import { SlashCommandBuilder } from "discord.js";
import { Embed } from "../../structures/Embed.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings the bot."),
  run: async ({ interaction }) => {
    interaction.reply({
      embeds: [new Embed().setDescription("Pong!")],
    });
  },
};
