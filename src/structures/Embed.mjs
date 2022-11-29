import { EmbedBuilder, resolveColor } from "discord.js";
import { colors } from "../config.mjs";

export class Embed extends EmbedBuilder {
  data = {
    color: resolveColor(colors.main),
  };
}

export class SuccessEmbed extends EmbedBuilder {
  data = {
    color: resolveColor(colors.success),
  };
}

export class FailEmbed extends EmbedBuilder {
  data = {
    color: resolveColor(colors.fail),
  };
}
