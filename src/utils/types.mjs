/**
 * @typedef {{ token: string; prefix: string }} EnvConfig
 */

/**
 * @typedef {Object} Command
 * @prop {import("discord.js").SlashCommandBuilder} data
 * @prop {(params: { client: import("../structures/BotClient.mjs").BotClient, interaction: import("discord.js").ChatInputCommandInteraction & { member: import("discord.js").GuildMember } }) => Promise<any>} run
 * @prop {(params: { client: import("../structures/BotClient.mjs").BotClient, interaction: import("discord.js").AutocompleteInteraction }) => Promise<any>} autocomplete
 */

/** @typedef {(client: import("../structures/BotClient.mjs").BotClient) => Promise<any>} Feature */
