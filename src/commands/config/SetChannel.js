const logger = require('@greencoast/logger');
const ExtendedCommand = require('../../classes/extensions/ExtendedCommand');
const { GUILD_KEYS } = require('../../db');
const { parseChannelMention } = require('../../common/utils');

class SetChannelCommand extends ExtendedCommand {
  constructor(client) {
    super(client, {
      name: 'setchannel',
      emoji: ':loudspeaker:',
      memberName: 'setchannel',
      group: 'config',
      description: 'Set the channel to which the bot will announce whenever there is a free game offer.',
      examples: [`${client.commandPrefix}setchannel <channel_mention>`],
      guildOnly: true,
      argsType: 'multiple',
      userPermissions: ['MANAGE_CHANNELS']
    });
  }

  updateChannel(message, channel) {
    const previousChannelID = this.client.provider.get(message.guild, GUILD_KEYS.channel);

    if (previousChannelID === channel.id) {
      message.reply('the channel you mentioned is already set as the announcement channel.');
      return;
    }

    return this.client.provider.set(message.guild, GUILD_KEYS.channel, channel.id)
      .then(() => {
        logger.info(`Announcement channel changed for ${message.guild.name} to #${channel.name}.`);
        message.say(`The announcement channel has been changed to **#${channel.name}**.`);
      })
      .catch((error) => {
        logger.error(error);
        message.say('Something happened when trying to update the announcement channel.');
      });
  }

  run(message, [channelMention]) {
    super.run(message);

    if (!channelMention) {
      message.reply('you need to mention the channel you wish to set.');
      return;
    }

    const channel = parseChannelMention(message.guild.channels, channelMention);

    if (!channel) {
      message.reply("I couldn't find the channel you mentioned, are you sure it exists?");
      return;
    }

    if (!channel.viewable) {
      message.reply('I cannot see the channel you mentioned, do I have enough permissions to access it?');
      return;
    }

    this.updateChannel(message, channel);
  }
}

module.exports = SetChannelCommand;
