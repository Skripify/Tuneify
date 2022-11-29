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
 * @returns {Promise<import("discord.js").InteractionResponse> | true}
 */
export function checkConnection(interaction) {
  const { channel } = interaction.member.voice;
  const { me } = interaction.guild.members;

  if (!channel)
    return (
      interaction.reply({
        embeds: [
          new FailEmbed().setDescription("You need to be in a voice channel."),
        ],
        ephemeral: true,
      }),
      false
    );

  if (me.voice.channel && me.voice.channel.id !== channel.id)
    return (
      interaction.reply({
        embeds: [
          new FailEmbed().setDescription(
            "We need to be in the same voice channel."
          ),
        ],
        ephemeral: true,
      }),
      false
    );

  if (!channel.members.has(me.id) && channel.userLimit !== 0 && channel.full)
    return (
      interaction.reply({
        embeds: [new FailEmbed().setDescription("Your voice channel is full.")],
        ephemeral: true,
      }),
      false
    );

  return true;
}

/**
 *
 * @param {import("../structures/BotClient.mjs").BotClient} client
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 * @returns {Promise<import("discord.js").InteractionResponse> | true}
 */
export function checkQueue(client, interaction) {
  const queue = client.player.getQueue(interaction.guild.id);
  if (!queue || !queue.playing)
    return (
      interaction.reply({
        embeds: [
          new FailEmbed().setDescription(
            "No music is being played in this server."
          ),
        ],
        ephemeral: true,
      }),
      false
    );

  return true;
}
