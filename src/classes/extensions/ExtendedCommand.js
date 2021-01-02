/* eslint-disable max-params */
/* eslint-disable no-unused-vars */
const { Command } = require('discord.js-commando');
const logger = require('@greencoast/logger');

class ExtendedCommand extends Command {
  constructor(client, options) {
    super(client, options);

    this.emoji = options.emoji;
  }

  onError(err, message, args, fromPattern, result) {
    const origin = message.guild ? message.guild.name : 'DM';

    this.client.handleCommandError(err, `An error occurred when running the command **${this.name}** in **${origin}**. Triggering message: **${message.content}**`);
    return message.reply('Something wrong happened when executing this command.');
  }

  run(message, args, fromPattern, result) {
    const origin = message.guild ? message.guild.name : 'DM';
    const author = message.member ? message.member.displayName : message.author.username;

    logger.info(`User ${author} executed ${this.name} from ${origin}.`);
  }
}

module.exports = ExtendedCommand;

