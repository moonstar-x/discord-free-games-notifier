import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default class ConfigureCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'configure',
      builder: new SlashCommandBuilder()
        .setName('configure')
        .setNameLocalizations({
          'en-US': 'configure',
          'en-GB': 'configure',
          'es-ES': 'configurar',
          'es-419': 'configurar',
          fr: 'configurer'
        })
        .setDescription('Change the configuration for this server.')
        .setDescriptionLocalizations({
          'en-US': 'Change the configuration for this server.',
          'en-GB': 'Change the configuration for this server.',
          'es-ES': 'Cambia la configuración para este servidor.',
          'es-419': 'Cambia la configuración para este servidor.',
          fr: 'Changez la configuration pour ce serveur.'
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    });
  }

  public override async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Hi' });
  }
}
