import { SlashCommandBuilder } from "discord.js";
import { Embed } from "../../structures/Embed.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings the bot."),
  run: async ({ client, interaction }) => {
    await interaction
      .reply({
        embeds: [new Embed().setDescription("Pinging...")],
        ephemeral: true,
        fetchReply: true,
      })
      .then((res) => {
        const ping = res.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply({
          embeds: [
            new Embed().setDescription(
              `**🧠 Bot**: ${ping}ms\n**📶 API**: ${client.ws.ping}ms`
            ),
          ],
        });
      });
  },
};
