import { SlashCommandBuilder } from "discord.js";
import { FailEmbed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join your voice channel."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(client, interaction)) return;

    const { me } = interaction.guild.members;
    if (me.voice.channel?.id === interaction.member.voice.channel.id)
      return interaction.reply({
        embeds: [
          new FailEmbed().setDescription("I'm already in your voice channel."),
        ],
        ephemeral: true,
      });

    client.player.voices.join(interaction.member.voice.channel);
    interaction.reply({
      embeds: [new SuccessEmbed().setDescription("Joined your voice channel!")],
      ephemeral: true,
    });
  },
};
