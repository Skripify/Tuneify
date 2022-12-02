import { activity } from "../config.mjs";

/**
 * @param {import("../structures/BotClient.mjs").BotClient} client
 * @param {number} id
 */
export default (client, id) => {
  console.log(`Launched shard #${id}.`);

  client.user.setActivity({
    name: activity.name + ` | Shard #${id}`,
    type: activity.type,
    url: activity.url,
    shardId: id,
  });
};
