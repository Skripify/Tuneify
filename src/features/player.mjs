import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { emotes } from "../config.mjs";
import { Embed, FailEmbed, SuccessEmbed } from "../structures/Embed.mjs";
import {
  checkConnection,
  checkQueue,
  formatRepeatMode,
} from "../utils/functions.mjs";
import { RepeatMode } from "distube";
const PlayerMap = new Map();
let songEditInterval = null;

/** @type {import("../utils/types.mjs").Feature} */
export default (client) => {
  client.player
    .on("initQueue", (queue) => {
      client.db.ensure(queue.id, {
        defaultVolume: 50,
      });

      const data = client.db.get(queue.id);
      queue.setVolume(data.defaultVolume);
    })
    .on("playSong", async (queue, track) => {
      if (!client.guilds.cache.get(queue.id).members.me.voice.deaf)
        client.guilds.cache.get(queue.id).members.me.voice.setDeaf(true);

      const currentSongMsg = await queue.textChannel
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
          const newQueue = client.player.getQueue(queue.id);
          await currentSongMsg.edit(
            recieveQueueData(newQueue, newQueue.songs[0])
          );
        } catch (e) {
          clearInterval(songEditInterval);
        }
      }, 10000);

      collector.on("collect", async (i) => {
        if (!checkConnection(i)) return;
        if (!checkQueue(client, i)) return;

        const newQueue = client.player.getQueue(queue.id);

        edited = true;
        setTimeout(() => {
          edited = false;
        }, 7000);

        switch (i.customId) {
          case "previous":
            {
              await queue.previous();

              currentSongMsg.edit({
                embeds: [
                  new Embed().setDescription(
                    `This song was skipped by ${i.user.tag}.`
                  ),
                ],
                components: [],
              });
              PlayerMap.delete("currentMsg");
              i.reply({
                embeds: [
                  new SuccessEmbed().setDescription(
                    "Skipped to previous song!"
                  ),
                ],
                ephemeral: true,
              });
            }
            break;
          case "playpause":
            {
              if (queue.paused) {
                queue.resume();

                currentSongMsg.edit(
                  recieveQueueData(newQueue, newQueue.songs[0])
                );
                i.reply({
                  embeds: [new SuccessEmbed().setDescription("Resumed!")],
                  ephemeral: true,
                });
              } else {
                queue.pause();

                currentSongMsg.edit(
                  recieveQueueData(newQueue, newQueue.songs[0])
                );
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
              PlayerMap.delete("currentMsg");
              i.reply({
                embeds: [
                  new SuccessEmbed().setDescription(
                    "Skipped the current song!"
                  ),
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
              PlayerMap.delete("currentMsg");
              i.reply({
                embeds: [
                  new SuccessEmbed().setDescription("Stopped the queue!"),
                ],
                ephemeral: true,
              });
            }
            break;
          case "shuffle":
            {
              if (client.maps.has(`beforeshuffle-${newQueue.id}`)) {
                newQueue.songs = [
                  newQueue.songs[0],
                  ...client.maps.get(`beforeshuffle-${newQueue.id}`),
                ];
                client.maps.delete(`beforeshuffle-${newQueue.id}`);

                i.reply({
                  embeds: [
                    new SuccessEmbed().setDescription("Unshuffled the queue!"),
                  ],
                  ephemeral: true,
                });
              } else {
                client.maps.set(
                  `beforeshuffle-${newQueue.id}`,
                  newQueue.songs.slice(1)
                );
                await newQueue.shuffle();

                i.reply({
                  embeds: [
                    new SuccessEmbed().setDescription("Shuffled the queue!"),
                  ],
                  ephemeral: true,
                });
              }
            }
            break;
          case "loop":
            {
              const repeat = newQueue.setRepeatMode();
              const newRepeat = formatRepeatMode(repeat);

              currentSongMsg.edit(
                recieveQueueData(newQueue, newQueue.songs[0])
              );
              i.reply({
                embeds: [
                  new SuccessEmbed().setDescription(
                    newRepeat?.length
                      ? `Set loop mode to: ${newRepeat}!`
                      : "Disabled loop!"
                  ),
                ],
                ephemeral: true,
              });
            }
            break;
          case "forward":
            {
              let seektime = newQueue.currentTime + 10;
              if (seektime >= newQueue.songs[0].duration)
                seektime = newQueue.songs[0].duration - 1;
              await newQueue.seek(Number(seektime));
              collector.resetTimer({
                time:
                  (newQueue.songs[0].duration - newQueue.currentTime) * 1000,
              });

              currentSongMsg.edit(
                recieveQueueData(newQueue, newQueue.songs[0])
              );
              i.reply({
                embeds: [
                  new SuccessEmbed().setDescription(
                    `Skipped to \`${newQueue.formattedCurrentTime}\`!`
                  ),
                ],
                ephemeral: true,
              });
            }
            break;
          case "rewind":
            {
              let seektime = newQueue.currentTime - 10;
              if (seektime < 0) seektime = 0;
              if (seektime >= newQueue.songs[0].duration - newQueue.currentTime)
                seektime = 0;
              await newQueue.seek(Number(seektime));
              collector.resetTimer({
                time:
                  (newQueue.songs[0].duration - newQueue.currentTime) * 1000,
              });

              currentSongMsg.edit(
                recieveQueueData(newQueue, newQueue.songs[0])
              );
              i.reply({
                embeds: [
                  new SuccessEmbed().setDescription(
                    `Rewinded to \`${newQueue.formattedCurrentTime}\`!`
                  ),
                ],
                ephemeral: true,
              });
            }
            break;
        }
      });
    })
    .on("finishSong", (queue) => {
      if (!PlayerMap.has("currentMsg")) return;

      queue.textChannel.messages
        .fetch(PlayerMap.get("currentMsg"))
        .then((currentSongMsg) => {
          currentSongMsg.edit({
            embeds: [new Embed().setDescription("This song has ended.")],
            components: [],
          });
          PlayerMap.delete(`currentmsg`);
        });
    });

  /**
   *
   * @param {import('distube').Queue} queue
   * @param {import('distube').Song} track
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
        name: track.name,
        iconURL:
          "https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif",
        url: track.url,
      })
      .setThumbnail(`https://img.youtube.com/vi/${track.id}/mqdefault.jpg`)
      .addFields(
        {
          name: "💡 Requested by:",
          value: `>>> ${track.member}`,
          inline: true,
        },
        {
          name: "⏱ Duration:",
          value: `>>> \`${queue.formattedCurrentTime}\`/\`${track.formattedDuration}\``,
          inline: true,
        }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji(emotes.player.previous)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!queue.previousSongs || queue.previousSongs.length === 0),
      new ButtonBuilder()
        .setCustomId("playpause")
        .setEmoji(queue.playing ? emotes.player.pause : emotes.player.play)
        .setStyle(queue.playing ? ButtonStyle.Secondary : ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji(emotes.player.next)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(queue.songs.length <= 1),
      new ButtonBuilder()
        .setCustomId("stop")
        .setEmoji(emotes.player.stop)
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("shuffle")
        .setEmoji(emotes.player.shuffle)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(queue.songs.length <= 1)
    );
    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("loop")
        .setEmoji(
          queue.repeatMode === RepeatMode.SONG
            ? emotes.player.loop.single
            : emotes.player.loop.default
        )
        .setStyle(
          queue.repeatMode === RepeatMode.DISABLED
            ? ButtonStyle.Secondary
            : ButtonStyle.Success
        ),
      new ButtonBuilder()
        .setCustomId("forward")
        .setEmoji(emotes.player.forward)
        .setLabel("+10s")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(Math.floor(track.duration - queue.currentTime) <= 10),
      new ButtonBuilder()
        .setCustomId("rewind")
        .setEmoji(emotes.player.rewind)
        .setLabel("-10s")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(Math.floor(queue.currentTime) < 10)
    );

    return {
      embeds: [embed],
      components: [row, row2],
    };
  }
};
