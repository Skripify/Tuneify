/** @type {import("../utils/types.mjs").Feature} */
export default (client) => {
  client.player.on("trackStart", (queue, track) => {
    queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`);
  });
};
