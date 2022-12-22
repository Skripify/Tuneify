import { SlashCommandBuilder } from "discord.js";
import { Embed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song."),
  run: async ({ client, interaction }) => {
    if (!checkConnection(client, interaction)) return;
    if (!checkQueue(client, interaction)) return;

    const queue = client.player.getQueue(interaction.guild.id);

    queue?.textChannel?.messages
      .fetch(client.db.get(interaction.guild.id, "currentMsg"))
      .then((currentSongMsg) => {
        currentSongMsg.edit({
          embeds: [
            new Embed().setDescription(
              `This song was skipped by ${interaction.user.tag}.`
            ),
          ],
          components: [],
        });
        client.db.delete(interaction.guild.id, "currentMsg");
      })
      .catch(() => null);
    await queue.skip();

    interaction.reply({
      embeds: [new SuccessEmbed().setDescription("Skipped the current song!")],
      ephemeral: true,
    });
  },
};
