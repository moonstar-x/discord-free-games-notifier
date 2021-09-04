const { Command } = require('@greencoast/discord.js-extended');
const logger = require('@greencoast/logger');
const { GUILD_KEYS } = require('../../common/constants');

class DisableCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'disable',
      description: 'Disable free game announcements on this server.',
      emoji: ':no_entry_sign:',
      group: 'config',
      guildOnly: true,
      ownerOverride: false,
      userPermissions: ['MANAGE_CHANNELS']
    });
  }

  async run(message) {
    const currentChannel = await this.client.dataProvider.get(message.guild, GUILD_KEYS.channel, null);
  
    if (!currentChannel) {
      return message.reply('no announcement channel is currently set.');
    }

    await this.client.dataProvider.set(message.guild, GUILD_KEYS.channel, null);
    
    logger.info(`Announcements have been disabled for ${message.guild.name}.`);
    return message.channel.send('Announcements have been disabled on this server.');
  }
}

module.exports = DisableCommand;
