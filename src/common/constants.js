const MESSAGE_EMBED = {
  color: '#43aa8b',
  thumbnail: 'https://i.imgur.com/Tqnk48j.png',
  issuesURL: 'https://github.com/moonstar-x/discord-free-games-notifier/issues'
};

const CRON = {
  EVERY_MINUTE: '* * * * *',
  EVERY_30_MINS: '*/30 * * * *',
  MOMENT_DATE_FORMAT: 'ddd, D/M/Y @hh:mm:ss a'
};

const GUILD_KEYS = {
  channel: 'channel'
};

module.exports = {
  MESSAGE_EMBED,
  CRON,
  GUILD_KEYS
};
