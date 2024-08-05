import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default class OffersCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'offers',
      builder: new SlashCommandBuilder()
        .setName('offers')
        .setNameLocalizations({
          'en-US': 'offers',
          'en-GB': 'offers',
          'es-ES': 'ofertas',
          'es-419': 'ofertas',
          fr: 'offres'
        })
        .setDescription('Get a list of free games currently offered.')
        .setDescriptionLocalizations({
          'en-US': 'Get a list of free games currently offered.',
          'en-GB': 'Get a list of free games currently offered.',
          'es-ES': 'Obten una lista de los juegos gratis en oferta.',
          'es-419': 'Obten una lista de los juegos gratis en oferta.',
          fr: 'Obtenez une liste des jeux offerts actuellement.'
        })
    });
  }

  public override async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Hi' });
  }
}
