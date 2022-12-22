import { SlashCommandBuilder } from "discord.js";
import { Embed, SuccessEmbed } from "../../structures/Embed.mjs";
import { checkConnection, checkQueue } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the player from playing music."),
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
              `The queue was stopped by ${interaction.user.tag}.`
            ),
          ],
          components: [],
        });
        client.db.delete(interaction.guild.id, "currentMsg");
      })
      .catch(() => null);
    await queue.stop();

    interaction.reply({
      embeds: [new SuccessEmbed().setDescription("Stopped the queue!")],
      ephemeral: true,
    });
  },
};
