import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getInteractionTranslator, translateAll, translateDefault } from '../i18n/translate';
import { getCurrentGameOffers } from '../features/gameOffers/functions/getCurrentGameOffers';
import { getStorefronts } from '../features/gameOffers/functions/getStorefronts';
import { offerToMessage } from '../models/gameOffer';

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
    await interaction.deferReply();
    const t = getInteractionTranslator(interaction);
    const offers = await getCurrentGameOffers();

    if (!offers.length) {
      const storefronts = await getStorefronts();
      await interaction.editReply({ content: t('commands.offers.run.empty.text', { list: storefronts.join(', ') }) });
      return;
    }

    await interaction.editReply({ content: t('commands.offers.run.start.text') });

    for (const offer of offers) {
      const { embed, component } = offerToMessage(offer, t);
      await interaction.followUp({ embeds: [embed], components: [component] });
    }
  }
}
