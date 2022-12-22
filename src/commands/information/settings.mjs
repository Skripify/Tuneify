import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { FailEmbed, SuccessEmbed } from "../../structures/Embed.mjs";

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
    .addSubcommandGroup((group) =>
      group
        .setName("vc")
        .setDescription("Configure voice channels.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add a voice channel.")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("The voice channel to add.")
                .addChannelTypes(
                  ChannelType.GuildVoice,
                  ChannelType.GuildStageVoice
                )
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove a voice channel.")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("The voice channel to remove.")
                .addChannelTypes(
                  ChannelType.GuildVoice,
                  ChannelType.GuildStageVoice
                )
                .setRequired(true)
            )
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  run: async ({ client, interaction }) => {
    client.db.ensure(interaction.guild.id, {
      defaultVolume: 50,
      vcs: [],
    });

    const subcommand = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup();

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
    } else if (group === "vc") {
      switch (subcommand) {
        case "add":
          {
            const channel = interaction.options.getChannel("channel");

            const vcs = client.db.get(interaction.guild.id, "vcs");
            if (vcs.includes(channel.id))
              return interaction.reply({
                embeds: [
                  new FailEmbed().setDescription(
                    "That voice channel has already been added."
                  ),
                ],
                ephemeral: true,
              });

            client.db.push(interaction.guild.id, channel.id, "vcs");

            interaction.reply({
              embeds: [
                new SuccessEmbed().setDescription(
                  "Voice channel added successfully!"
                ),
              ],
              ephemeral: true,
            });
          }
          break;
        case "remove":
          {
            const channel = interaction.options.getChannel("channel");

            const vcs = client.db.get(interaction.guild.id, "vcs");
            if (!vcs.includes(channel.id))
              return interaction.reply({
                embeds: [
                  new FailEmbed().setDescription(
                    "That voice channel has not been added yet."
                  ),
                ],
                ephemeral: true,
              });

            client.db.remove(interaction.guild.id, channel.id, "vcs");

            interaction.reply({
              embeds: [
                new SuccessEmbed().setDescription(
                  "Voice channel removed successfully!"
                ),
              ],
              ephemeral: true,
            });
          }
          break;
      }
    }
  },
};
