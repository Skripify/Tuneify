import { SlashCommandBuilder } from "discord.js";
import { Embed } from "../../structures/Embed.mjs";
import {
  checkConnection,
  checkQueue,
  createBar,
} from "../../utils/functions.mjs";

/** @type {import('../../utils/types.mjs').Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("View the currently playing song."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(client, interaction)) return;
    if (!checkQueue(client, interaction)) return;

    const queue = client.player.getQueue(interaction.guild.id);
    const track = queue.songs[0];

    interaction.reply({
      embeds: [
        new Embed()
          .setAuthor({
            name: "Now playing:",
            iconURL: interaction.guild.iconURL(),
          })
          .setTitle(track.name)
          .setURL(track.url)
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
            },
            {
              name: "⌛ Progress:",
              value: createBar(track.duration, queue.currentTime),
              inline: false,
            }
          ),
      ],
    });
  },
};
