import { SlashCommandBuilder } from "discord.js";
import { SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave your voice channel."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(client, interaction)) return;

    const { me } = interaction.guild.members;
    if (
      !me.voice.channel ||
      me.voice.channel.id !== interaction.member.voice.channel.id
    )
      return interaction.reply({
        embeds: [
          new FailEmbed().setDescription("I'm not in your voice channel."),
        ],
        ephemeral: true,
      });

    client.player.voices.leave(interaction.guild.id);
    interaction.reply({
      embeds: [new SuccessEmbed().setDescription("Left your voice channel!")],
      ephemeral: true,
    });
  },
};
