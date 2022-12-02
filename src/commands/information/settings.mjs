import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SuccessEmbed } from "../../structures/Embed.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Update settings.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("defaultvolume")
        .setDescription("Change the default volume for this server.")
        .addNumberOption((option) =>
          option
            .setName("percentage")
            .setDescription("The percentage to set the volume to.")
            .setMinValue(0)
            .setMaxValue(150)
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  run: async ({ client, interaction }) => {
    client.db.ensure(interaction.guild.id, {
      defaultVolume: 50,
    });

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "defaultvolume") {
      const percentage = interaction.options.getNumber("percentage");

      client.db.set(interaction.guild.id, percentage, "defaultVolume");

      interaction.reply({
        embeds: [
          new SuccessEmbed().setDescription(
            `Change the default volume to **${percentage}%**!`
          ),
        ],
        ephemeral: true,
      });
    }
  },
};
