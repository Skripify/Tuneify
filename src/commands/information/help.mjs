import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { Embed } from "../../structures/Embed.mjs";
import { capitalize, importFile } from "../../utils/functions.mjs";

/** @type {import("../../utils/types.mjs").Command} */
export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View my commands."),
  run: async ({ client, interaction }) => {
    const categories = [];

    for (const dir of fs.readdirSync("./src/commands")) {
      const commands = fs
        .readdirSync(`./src/commands/${dir}`)
        .filter((file) => file.endsWith("js"));

      const cmds = await Promise.all(
        commands.map(async (command) => {
          let file = await importFile(`../commands/${dir}/${command}`);
          if (!file?.data) return;

          return `\`${file.data.toJSON().name}\``;
        })
      ).then((x) => x.filter((x) => x).sort((a, b) => a.localeCompare(b)));

      if (!cmds) return;

      categories.push({
        name: `${capitalize(dir)} [${cmds.length}]`,
        value: cmds.join(", "),
      });
    }

    interaction.reply({
      embeds: [
        new Embed()
          .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL(),
          })
          .setFields(categories),
      ],
      ephemeral: true,
    });
  },
};
