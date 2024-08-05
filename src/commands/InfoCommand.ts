import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default class InfoCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'info',
      builder: new SlashCommandBuilder()
        .setName('info')
        .setNameLocalizations({
          'en-US': 'info',
          'en-GB': 'info',
          'es-ES': 'info',
          'es-419': 'info',
          fr: 'info'
        })
        .setDescription('Get the settings information saved for this server.')
        .setDescriptionLocalizations({
          'en-US': 'Get the settings information saved for this server.',
          'en-GB': 'Get the settings information saved for this server.',
          'es-ES': 'Obten la información de configuración para este servidor.',
          'es-419': 'Obten la información de configuración para este servidor.',
          fr: 'Obtenez la information de configuration pour ce serveur.'
        })
        .setDMPermission(false)
    });
  }

  public override async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Hi' });
  }
}
