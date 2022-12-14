import { FailEmbed } from "../structures/Embed.mjs";
import { RepeatMode } from "distube";

/**
 *
 * @param {string} path
 * @returns any
 */
export async function importFile(path) {
  return (await import(path))?.default;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  return str[0].toUpperCase() + str.toLowerCase().slice(1);
}

/**
 * @param {import("../structures/BotClient.mjs").BotClient} client
 * @param {import("discord.js").Interaction<"cached">} interaction
 * @returns {boolean}
 */
export function checkConnection(client, interaction) {
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

  if (!channel.permissionsFor(me).has("Connect"))
    return (
      interaction.reply({
        embeds: [
          new FailEmbed().setDescription("I can't join your voice channel."),
        ],
        ephemeral: true,
      }),
      false
    );

  if (!channel.permissionsFor(me).has("Speak"))
    return (
      interaction.reply({
        embeds: [
          new FailEmbed().setDescription("I can't speak your voice channel."),
        ],
        ephemeral: true,
      }),
      false
    );

  client.db.ensure(interaction.guild.id, {
    vcs: [],
  });

  const vcs = client.db.get(interaction.guild.id, "vcs");
  if (vcs.length && !vcs.includes(channel.id))
    return (
      interaction.reply({
        embeds: [
          new FailEmbed().setDescription(
            "Your voice channel is not whitelisted."
          ),
        ],
        ephemeral: true,
      }),
      false
    );

  return true;
}

/**
 *
 * @param {import("../structures/BotClient.mjs").BotClient} client
 * @param {import("discord.js").Interaction} interaction
 * @returns {boolean}
 */
export function checkQueue(client, interaction) {
  const queue = client.player.getQueue(interaction.guild.id);
  if (!queue || !queue.songs || queue.songs.length === 0)
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

/**
 *
 * @param {import("distube").RepeatMode} repeatMode
 * @returns {string | null}
 */
export function formatRepeatMode(repeatMode) {
  switch (repeatMode) {
    case RepeatMode.QUEUE: {
      return "Queue";
    }
    case RepeatMode.SONG: {
      return "Song";
    }
    default: {
      return null;
    }
  }
}

/**
 * @param {number} duration
 * @param {number} position
 */
export function createBar(duration, position) {
  try {
    const full = "???";
    const empty = "???";
    const size = "??????????????????????????????????????????????????????????????????".length;
    const percent =
      duration == 0 ? null : Math.floor((position / duration) * 100);
    const fullBars = Math.round(size * (percent / 100));
    const emptyBars = size - fullBars;
    return `**${full.repeat(fullBars)}${empty.repeat(emptyBars)}**`;
  } catch (e) {
    console.error(e);
  }
}
