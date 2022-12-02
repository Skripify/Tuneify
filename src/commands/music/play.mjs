import { SlashCommandBuilder } from "discord.js";
import { Embed, SuccessEmbed } from "../../structures/Embed.mjs";
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
    ),
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

    const queue = client.player.getQueue(interaction.guild.id);
    /** @type {import("distube").PlayOptions} */
    let options = {
      member: interaction.member,
    };
    if (!queue) options.textChannel = interaction.channel;

    await client.player.play(interaction.member.voice.channel, query, options);

    interaction.editReply({
      embeds: [
        new SuccessEmbed().addFields({
          name:
            queue?.songs?.length > 0
              ? `👍 Queued at #${queue?.songs?.length + 1}`
              : "🎶 Now playing",
          value: `\`\`\`${query}\`\`\``,
        }),
      ],
    });
  },
};
