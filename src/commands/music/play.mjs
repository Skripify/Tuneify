import { QueryType } from "discord-player";
import { SlashCommandBuilder } from "discord.js";
import { Embed, FailEmbed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription(
          "The song you want to play. You can use a search query or URL."
        )
        .setRequired(true)
        .setAutocomplete(true)
    ),
  autocomplete: async ({ client, interaction }) => {
    const focusedValue = interaction.options.getFocused();
    const choices = await client.player
      .search(focusedValue, {
        requestedBy: interaction.user,
      })
      .then((result) => result.tracks);
    await interaction
      .respond(
        choices.map((choice) => ({ name: choice.title, value: choice.title }))
      )
      .catch(() => null);
  },
  run: async ({ client, interaction }) => {
    if (!checkConnection(interaction)) return;

    const query = interaction.options.getString("query");

    interaction.reply({
      embeds: [
        new Embed().addFields({
          name: "🔎 Searching...",
          value: `\`\`\`${query}\`\`\``,
        }),
      ],
      ephemeral: true,
    });

    const result = await client.player.search(query, {
      requestedBy: interaction.user,
    });

    if (!result || !result.tracks.length)
      return interaction.editReply({
        embeds: [
          new FailEmbed().addFields({
            name: "❌ No results found.",
            value: `\`\`\`${query}\`\`\``,
          }),
        ],
      });

    const queue = await client.player.createQueue(interaction.guild, {
      initialVolume: 50,
      ytdlOptions: {
        filter: "audioonly",
        highWaterMark: 1 << 30,
        dlChunkSize: 0,
      },
      metadata: {
        channel: interaction.channel,
      },
    });

    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    result.playlist
      ? queue.addTracks(result.tracks)
      : queue.addTrack(result.tracks[0]);

    if (!queue.playing) await queue.play();

    interaction.editReply({
      embeds: [
        new SuccessEmbed().addFields({
          name:
            queue.tracks.length > 0
              ? `👍 Queued at #${queue.tracks.length + 1}`
              : "🎶 Now playing",
          value: `\`\`\`${query}\`\`\``,
        }),
      ],
    });
  },
};
