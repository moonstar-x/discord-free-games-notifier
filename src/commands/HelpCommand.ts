import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { translateAll, translateDefault } from '../i18n/translate';

export default class HelpCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'help',
      builder: new SlashCommandBuilder()
        .setName(translateDefault('commands.help.name'))
        .setNameLocalizations(translateAll('commands.help.name'))
        .setDescription(translateDefault('commands.help.description'))
        .setDescriptionLocalizations(translateAll('commands.help.description'))
    });
  }

  public override async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Hi' });
  }
}
