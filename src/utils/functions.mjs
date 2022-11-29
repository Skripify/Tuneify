import { FailEmbed } from "../structures/Embed.mjs";

/**
 *
 * @param {string} path
 * @returns any
 */
export async function importFile(path) {
  return (await import(path))?.default;
}

/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 * @returns {import("discord.js").Message | true}
 */
export async function checkConnection(interaction) {
  const { channel } = interaction.member.voice;
  const { me } = interaction.guild.members;

  if (!channel)
    return interaction.reply({
      embeds: [
        new FailEmbed().setDescription("You need to be in a voice channel."),
      ],
    });

  if (me.voice.channel && me.voice.channel.id !== channel.id)
    return interaction.reply({
      embeds: [
        new FailEmbed().setDescription(
          "We need to be in the same voice channel."
        ),
      ],
    });

  if (!channel.members.has(me.id) && channel.userLimit !== 0 && channel.full)
    return interaction.reply({
      embeds: [new FailEmbed().setDescription("Your voice channel is full.")],
    });

  return true;
}
