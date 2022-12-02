import { ActivityType } from "discord.js";

export const colors = {
  main: "#cc80ff",
  success: "#00ff00",
  fail: "#ff0000",
};

export const emotes = {
  previous: "<:previous:994438542077984768>",
  next: "<:next:994438540429643806>",
  success: "<:classic_check:1046366360604786688>",
  fail: "<:classic_x:1046366420457500742>",
  discord: "<:discord:1043438510616608779>",
  player: {
    previous: "<:previous_song:994440947863658516>",
    pause: "<:pause:994440942528512152>",
    play: "<:next:994438540429643806>",
    next: "<:next_song:994440946030739486>",
    stop: "<:stop:994442358705893378>",
    shuffle: "<:shuffle:994442357019779132>",
    loop: {
      default: "<:loop:994442351953055844>",
      single: "<:loopsingle:994442353655939153>",
    },
    forward: "<:forward:994442350032081027>",
    rewind: "<:rewind:994442355442720888>",
  },
};

export const guildId = "977485367294959627";
export const postStats = false;

/** @type {import("discord.js").ActivityOptions} */
export const activity = {
  name: "music",
  type: ActivityType.Listening,
};
