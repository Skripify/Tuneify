import { SlashCommandBuilder } from "discord.js";
import { FailEmbed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the queue."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(interaction)) return;
    if (!checkQueue(client, interaction)) return;
    if (client.maps.has(`beforeshuffle-${interaction.guild.id}`))
      return interaction.reply({
        embeds: [
          new FailEmbed().setDescription(
            "The queue has already been shuffled before. Try using the `unshuffle` command instead."
          ),
        ],
      });

    const queue = client.player.getQueue(interaction.guild.id);
    client.maps.set(
      `beforeshuffle-${interaction.guild.id}`,
      queue.songs.slice(1)
    );
    await queue.shuffle();

    interaction.reply({
      embeds: [new SuccessEmbed().setDescription("Shuffled the queue!")],
      ephemeral: true,
    });
  },
};
