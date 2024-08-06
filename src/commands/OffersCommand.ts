import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { translateAll, translateDefault } from '../i18n/translate';

export default class OffersCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'offers',
      builder: new SlashCommandBuilder()
        .setName(translateDefault('commands.offers.name'))
        .setNameLocalizations(translateAll('commands.offers.name'))
        .setDescription(translateDefault('commands.offers.description'))
        .setDescriptionLocalizations(translateAll('commands.offers.description'))
    });
  }

  public override async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Hi' });
  }
}
