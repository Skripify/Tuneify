import { SlashCommandBuilder } from "discord.js";
import { RepeatMode } from "distube";
import { SuccessEmbed } from "../../structures/Embed.mjs";
import {
  checkConnection,
  checkQueue,
  formatRepeatMode,
} from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set the loop mode for the queue.")
    .addNumberOption((option) =>
      option
        .setName("mode")
        .setDescription("The new loop mode.")
        .setRequired(false)
        .setChoices(
          { name: "Off", value: RepeatMode.DISABLED },
          { name: "Song", value: RepeatMode.SONG },
          { name: "Queue", value: RepeatMode.QUEUE }
        )
    ),
  run: async ({ client, interaction }) => {
    if (!checkConnection(interaction)) return;
    if (!checkQueue(client, interaction)) return;

    const queue = client.player.getQueue(interaction.guild.id);

    const repeat = queue.setRepeatMode(
      interaction.options.getNumber("mode") || undefined
    );
    const newRepeat = formatRepeatMode(repeat);

    interaction.reply({
      embeds: [
        new SuccessEmbed().setDescription(
          newRepeat?.length
            ? `Set loop mode to: ${newRepeat}!`
            : "Disabled loop!"
        ),
      ],
      ephemeral: true,
    });
  },
};
