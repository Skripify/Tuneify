import { SlashCommandBuilder } from "discord.js";
import { SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Changes the volume of the player.")
    .addNumberOption((option) =>
      option
        .setName("percentage")
        .setDescription("The percentage to set the volume to.")
        .setMinValue(0)
        .setMaxValue(150)
        .setRequired(true)
    ),
  run: async ({ client, interaction }) => {
    if (!checkConnection(interaction)) return;
    if (!checkQueue(client, interaction)) return;

    const queue = client.player.getQueue(interaction.guild.id);
    const volume = interaction.options.getNumber("percentage");

    queue.setVolume(volume);

    interaction.reply({
      embeds: [
        new SuccessEmbed().setDescription(
          `Changed the volume to **${volume}%**!`
        ),
      ],
      ephemeral: true,
    });
  },
};
