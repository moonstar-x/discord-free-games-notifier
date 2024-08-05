import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default class HelpCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'help',
      builder: new SlashCommandBuilder()
        .setName('help')
        .setNameLocalizations({
          'en-US': 'help',
          'en-GB': 'help',
          'es-ES': 'ayuda',
          'es-419': 'ayuda',
          fr: 'aide'
        })
        .setDescription('Help and usage information.')
        .setDescriptionLocalizations({
          'en-US': 'Help and usage information.',
          'en-GB': 'Help and usage information.',
          'es-ES': 'Información de ayuda y utilización.',
          'es-419': 'Información de ayuda y utilización.',
          fr: "Information d'aide et d'utilisation."
        })
    });
  }

  public override async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Hi' });
  }
}
