import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { emotes } from "../config.mjs";
import { Embed, FailEmbed, SuccessEmbed } from "../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../utils/functions.mjs";
const PlayerMap = new Map();
let songEditInterval = null;

/** @type {import("../utils/types.mjs").Feature} */
export default (client) => {
  client.player.on("trackStart", async (queue, track) => {
    if (!queue.guild.members.me.voice.deaf)
      queue.guild.members.me.voice.setDeaf(true);

    /** @type {import("discord.js").Message} */
    const currentSongMsg = await queue.metadata.channel
      .send(recieveQueueData(queue, track))
      .then((msg) => {
        PlayerMap.set("currentMsg", msg.id);
        return msg;
      });
    const collector = currentSongMsg.createMessageComponentCollector({
      time: track.durationMS ? track.durationMS * 1000 : 600000,
      componentType: ComponentType.Button,
    });

    let edited = false;

    try {
      clearInterval(songEditInterval);
    } catch {}

    songEditInterval = setInterval(async () => {
      if (edited) return;
      try {
        const newQueue = client.player.getQueue(queue.guild.id);
        await currentSongMsg.edit(recieveQueueData(newQueue, newQueue.current));
      } catch (e) {
        clearInterval(songEditInterval);
      }
    }, 10000);

    collector.on("collect", async (i) => {
      if (!checkConnection(i)) return;
      if (!checkQueue(client, i)) return;

      const newQueue = client.player.getQueue(queue.guild.id);

      edited = true;
      setTimeout(() => {
        edited = false;
      }, 7000);

      switch (i.customId) {
        case "previous":
          {
            queue.back();

            currentSongMsg.edit({
              embeds: [
                new Embed().setDescription(
                  `This song was skipped by ${i.user.tag}.`
                ),
              ],
              components: [],
            });
            i.reply({
              embeds: [
                new SuccessEmbed().setDescription("Skipped to previous song!"),
              ],
              ephemeral: true,
            });
          }
          break;
        case "playpause":
          {
            if (queue.connection.paused) {
              queue.setPaused(false);

              currentSongMsg.edit(recieveQueueData(newQueue, newQueue.current));
              i.reply({
                embeds: [new SuccessEmbed().setDescription("Resumed!")],
                ephemeral: true,
              });
            } else {
              queue.setPaused(true);

              currentSongMsg.edit(recieveQueueData(newQueue, newQueue.current));
              i.reply({
                embeds: [new SuccessEmbed().setDescription("Paused!")],
                ephemeral: true,
              });
            }
          }
          break;
        case "next":
          {
            queue.skip();

            currentSongMsg.edit({
              embeds: [
                new Embed().setDescription(
                  `This song was skipped by ${i.user.tag}.`
                ),
              ],
              components: [],
            });
            i.reply({
              embeds: [
                new SuccessEmbed().setDescription("Skipped the current song!"),
              ],
              ephemeral: true,
            });
          }
          break;
        case "stop":
          {
            queue.stop();

            currentSongMsg.edit({
              embeds: [
                new Embed().setDescription(
                  `The queue was stopped by ${i.user.tag}.`
                ),
              ],
              components: [],
            });
            i.reply({
              embeds: [new SuccessEmbed().setDescription("Stopped the queue!")],
              ephemeral: true,
            });
          }
          break;
      }
    });
  });

  /**
   *
   * @param {import('discord-player').Queue} queue
   * @param {import('discord-player').Track} track
   * @returns {import("discord.js").MessageReplyOptions}
   */
  function recieveQueueData(queue, track) {
    if (!queue || !track)
      return {
        embeds: [
          new FailEmbed().setDescription(
            "An error happened on our end while trying to create the now playing embed."
          ),
        ],
      };

    const embed = new Embed()
      .setAuthor({
        name: track.title,
        iconURL:
          "https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif",
        url: track.url,
      })
      .setThumbnail(track.thumbnail)
      .addFields(
        {
          name: "💡 Requested by:",
          value: `>>> ${track.requestedBy}`,
          inline: true,
        },
        {
          name: "⏱ Duration:",
          value: `>>> \`${queue.getPlayerTimestamp().current}\`/\`${
            track.duration
          }\``,
          inline: true,
        }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji(emotes.player.previous)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(queue.previousTracks.length > 0),
      new ButtonBuilder()
        .setCustomId("playpause")
        .setEmoji(
          queue.connection.paused ? emotes.player.play : emotes.player.pause
        )
        .setStyle(
          queue.connection.paused ? ButtonStyle.Success : ButtonStyle.Secondary
        ),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji(emotes.player.next)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(queue.tracks.length >= 0),
      new ButtonBuilder()
        .setCustomId("stop")
        .setEmoji(emotes.player.stop)
        .setStyle(ButtonStyle.Danger)
    );

    return {
      embeds: [embed],
      components: [row],
    };
  }
};
