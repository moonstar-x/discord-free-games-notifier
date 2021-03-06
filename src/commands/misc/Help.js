const { MessageEmbed } = require('discord.js');
const ExtendedCommand = require('../../classes/extensions/ExtendedCommand');
const { MESSAGE_EMBED } = require('../../common/constants');

class HelpCommand extends ExtendedCommand {
  constructor(client) {
    super(client, {
      name: 'help',
      emoji: ':question:',
      memberName: 'help',
      group: 'misc',
      description: 'Get a description of all the commands you can use.',
      examples: [`${client.commandPrefix}help`],
      guildOnly: false
    });
  }

  run(message) {
    super.run(message);

    const embed = new MessageEmbed();

    const sectionedCommandList = this.client.registry.groups.map((group) => {
      const listOfCommands = group.commands.reduce((text, command) => {
        return `${text} ${command.emoji} **${command.name}** - ${command.description} \n`;
      }, '');
      return { title: group.name, text: listOfCommands };
    });

    embed.setTitle('Free Games Notifier Help Message');
    embed.setColor(MESSAGE_EMBED.color);
    embed.setThumbnail(MESSAGE_EMBED.thumbnail);
    sectionedCommandList.forEach(({ title, text }) => {
      embed.addField(title, text);
    });
    embed.addField('Found a bug?', `This bot is far from perfect, so in case you found a bug, please report it [here](${MESSAGE_EMBED.issuesURL}).`);

    message.embed(embed);
  }
}

module.exports = HelpCommand;
