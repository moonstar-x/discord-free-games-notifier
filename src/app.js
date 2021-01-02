const path = require('path');
const logger = require('@greencoast/logger');
const ExtendedClient = require('./classes/extensions/ExtendedClient');
const { discordToken, ownerID, prefix, inviteURL } = require('./common/settings');
const { isDebugEnabled } = require('./common/context');
const { connectDatabase } = require('./db');

const client = new ExtendedClient({
  commandPrefix: prefix,
  owner: ownerID,
  invite: inviteURL
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['misc', 'Miscellaneous Commands']
    // ['owner-only', 'Owner-Only Commands'],
    // ['config', 'Configuration Commands']
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'));

if (isDebugEnabled) {
  client.on('debug', (info) => {
    logger.debug(info);
  });
}

client.on('error', (error) => {
  logger.error(error);
});

client.on('guildCreate', (guild) => {
  logger.info(`Joined ${guild.name} guild!`);
  client.updatePresence();
});

client.on('guildDelete', (guild) => {
  logger.info(`Left ${guild.name} guild!`);
  client.updatePresence();
});

client.on('guildUnavailable', (guild) => {
  logger.warn(`Guild ${guild.name} is currently unavailable!`);
});

client.on('invalidated', () => {
  logger.error('Client connection invalidated, terminating execution with code 1.');
  process.exit(1);
});

client.on('rateLimit', (info) => {
  logger.warn(info);
});

client.on('ready', () => {
  logger.info('Connected to Discord! - Ready.');
  connectDatabase(client);
});

client.on('warn', (info) => {
  logger.warn(info);
});

client.login(discordToken);
