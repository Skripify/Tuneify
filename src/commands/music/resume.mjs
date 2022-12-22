import { SlashCommandBuilder } from "discord.js";
import { FailEmbed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the current song."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(client, interaction)) return;
    if (!checkQueue(client, interaction)) return;

    const queue = client.player.getQueue(interaction.guild.id);
    if (!queue.paused)
      return interaction.reply({
        embeds: [
          new FailEmbed().setDescription(
            "The current song is not paused. Try using `pause` instead."
          ),
        ],
      });

    queue.resume();

    interaction.reply({
      embeds: [new SuccessEmbed().setDescription("Resumed!")],
      ephemeral: true,
    });
  },
};
