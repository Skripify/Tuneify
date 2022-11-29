/** @param {import("../structures/BotClient.mjs").BotClient} client */
export default (client) => {
  console.log(`Logged in as ${client.user.tag}.`);
};
