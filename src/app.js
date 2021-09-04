const path = require('path');
const { ExtendedClient, ConfigProvider } = require('@greencoast/discord.js-extended');
const LevelDataProvider = require('@greencoast/discord.js-extended/dist/providers/LevelDataProvider').default;
const OffersNotifier = require('./classes/OffersNotifier');
const { DEBUG_ENABLED } = require('./common/context');

const config = new ConfigProvider({
  configPath: path.join(__dirname, '../config/settings.json'),
  env: process.env,
  default: {
    PREFIX: '$',
    OWNER_ID: null,
    OWNER_REPORTING: false,
    PRESENCE_REFRESH_INTERVAL: 15 * 60 * 1000 // 15 Minutes
  },
  types: {
    TOKEN: 'string',
    PREFIX: 'string',
    OWNER_ID: ['string', 'null'],
    OWNER_REPORTING: 'boolean',
    PRESENCE_REFRESH_INTERVAL: ['number', 'null']
  }
});

const client = new ExtendedClient({
  config,
  debug: DEBUG_ENABLED,
  errorOwnerReporting: config.get('OWNER_REPORTING'),
  owner: config.get('OWNER_ID'),
  prefix: config.get('PREFIX'),
  presence: {
    refreshInterval: config.get('PRESENCE_REFRESH_INTERVAL'),
    templates: [
      `{num_guilds} servers!`,
      `{prefix}help for help.`,
      `{num_members} users!`,
      `up for {uptime}.`
    ]
  }
});

const provider = new LevelDataProvider(client, path.join(__dirname, '../data'));

client
  .registerDefaultEvents()
  .registerExtraDefaultEvents();

client.registry
  .registerGroups([
    ['misc', 'Miscellaneous Commands'],
    ['config', 'Configuration Commands']
  ])
  .registerCommandsIn(path.join(__dirname, './commands'));

client.on('ready', async() => {
  await client.setDataProvider(provider);

  client.notifier = new OffersNotifier(client);
  client.notifier.initialize();
});

client.on('guildDelete', (guild) => {
  client.dataProvider.clear(guild);
});

client.login(config.get('TOKEN'));
