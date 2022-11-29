import { SlashCommandBuilder } from "discord.js";
import { FailEmbed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the player from playing music."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(interaction)) return;

    const queue = client.player.getQueue(interaction.guild.id);
    if (!queue || !queue.playing)
      return interaction.reply({
        embeds: [
          new FailEmbed().setDescription(
            "No music is being played in this channel"
          ),
        ],
      });

    queue.destroy();

    interaction.reply({
      embeds: [
        new SuccessEmbed().setDescription("Successfully stopped the player!"),
      ],
      ephemeral: true,
    });
  },
};
