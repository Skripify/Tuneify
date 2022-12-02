import { SlashCommandBuilder } from "discord.js";
import { FailEmbed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(interaction)) return;
    if (!checkQueue(client, interaction)) return;

    const queue = client.player.getQueue(interaction.guild.id);
    if (queue.paused)
      return interaction.reply({
        embeds: [
          new FailEmbed().setDescription(
            "The current song is already paused. Try using `resume` instead."
          ),
        ],
      });

    queue.pause();

    interaction.reply({
      embeds: [new SuccessEmbed().setDescription("Paused!")],
      ephemeral: true,
    });
  },
};
