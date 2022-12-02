import { SlashCommandBuilder } from "discord.js";
import { FailEmbed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the player from playing music."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(interaction)) return;
    if (!checkQueue(client, interaction)) return;

    const queue = client.player.getQueue(interaction.guild.id);

    await queue.stop();

    interaction.reply({
      embeds: [new SuccessEmbed().setDescription("Stopped the queue!")],
      ephemeral: true,
    });
  },
};
