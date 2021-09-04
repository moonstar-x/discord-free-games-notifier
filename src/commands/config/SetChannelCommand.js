const { Command } = require('@greencoast/discord.js-extended');
const logger = require('@greencoast/logger');
const { GUILD_KEYS } = require('../../common/constants');

class SetChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setchannel',
      aliases: ['channel'],
      description: 'Set the channel to which the bot will announce free game offers.',
      emoji: ':loudspeaker:',
      group: 'config',
      guildOnly: true,
      ownerOverride: false,
      userPermissions: ['MANAGE_CHANNELS']
    });
  }

  async updateChannel(message, channel) {
    const previousChannelID = await this.client.dataProvider.get(message.guild, GUILD_KEYS.channel);

    if (previousChannelID === channel.id) {
      return message.reply('the channel you mentioned is already set as the announcement channel.');
    }

    try {
      await this.client.dataProvider.set(message.guild, GUILD_KEYS.channel, channel.id);

      logger.info(`Announcement channel changed for ${message.guild.name} to #${channel.name}.`);
      return message.channel.send(`The announcement channel has been changed to ${channel}.`);
    } catch (error) {
      logger.error(error);
      return message.channel.send('Something happened when trying to update the announcement channel.');
    }
  }

  run(message) {
    const channel = message.mentions.channels.first();

    if (!channel) {
      return message.reply(`you need to mention the channel you wish to set.`);
    }

    if (!channel.viewable) {
      return message.reply(`I cannot see the channel you mentioned, do I have enough permissions to access it?`);
    }

    return this.updateChannel(message, channel);
  }
}

module.exports = SetChannelCommand;
