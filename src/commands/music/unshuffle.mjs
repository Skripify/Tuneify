import { SlashCommandBuilder } from "discord.js";
import { FailEmbed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("unshuffle")
    .setDescription("Unshuffles the queue."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(client, interaction)) return;
    if (!checkQueue(client, interaction)) return;
    if (!client.maps.has(`beforeshuffle-${interaction.guild.id}`))
      return interaction.reply({
        embeds: [
          new FailEmbed().setDescription(
            "The queue has not been shuffled before. Try using the `shuffle` command instead."
          ),
        ],
      });

    const queue = client.player.getQueue(interaction.guild.id);
    queue.songs = [
      queue.songs[0],
      ...client.maps.get(`beforeshuffle-${queue.id}`),
    ];
    client.maps.delete(`beforeshuffle-${queue.id}`);

    interaction.reply({
      embeds: [new SuccessEmbed().setDescription("Unshuffled the queue!")],
      ephemeral: true,
    });
  },
};
