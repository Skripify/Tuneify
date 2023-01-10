import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";
import { Embed } from "../../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("View the queue for this server."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(client, interaction)) return;
    if (!checkQueue(client, interaction)) return;

    const queue = client.player.getQueue(interaction.guild.id);
    let embeds = [];
    let k = 10;
    let theSongs = queue.songs.slice(1, queue.songs.length);
    for (let i = 0; i < theSongs.length; i += 10) {
      let qus = theSongs;
      const current = qus.slice(i, k);
      let j = i;
      const info = current
        .map(
          (track) =>
            `**${++j}.** [\`${String(track.name)}\`](${track.url}) - \`${
              track.formattedDuration
            }\``
        )
        .join("\n");
      const embed = new Embed()
        .setTitle(`📑 **Queue in ${interaction.guild.name}**`)
        .setDescription(info)
        .setFooter({
          text: `${theSongs.length} songs in the queue`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });
      if (i < 10) {
        embed.setDescription(
          `**Current song:**\n> [\`${queue.songs[0].name}\`](${queue.songs[0].url}) - \`${queue.songs[0].formattedDuration}\`\n\n${info}`
        );
      }
      embeds.push(embed);
      k += 10;
    }

    const getRow = (cur) => {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("994438542077984768")
          .setDisabled(cur === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("994438540429643806")
          .setDisabled(cur === embeds.length - 1)
      );

      return row;
    };

    let cur = 0;
    const res = await interaction.reply({
      embeds: [embeds[0]],
      components: [getRow(cur)],
      ephemeral: true,
      fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = res.createMessageComponentCollector({
      filter,
    });

    collector.on("collect", (i) => {
      if (i.customId !== "prev" && i.customId !== "next") return;

      if (i.customId === "prev" && cur > 0) {
        cur -= 1;
        i.update({
          embeds: [embeds[cur]],
          components: [getRow(cur)],
        });
      } else if (i.customId === "next" && cur < embeds.length - 1) {
        cur += 1;
        i.update({
          embeds: [embeds[cur]],
          components: [getRow(cur)],
        });
      }
    });
  },
};
