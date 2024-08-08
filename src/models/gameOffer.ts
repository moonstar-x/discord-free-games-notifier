import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { LocalizedTranslateFunction } from '../i18n/translate';
import { MESSAGE_EMBED_COLOR } from '../config/constants';

export type GameOfferType = 'game' | 'dlc' | 'bundle' | 'other';

export interface GameOffer {
  storefront: string
  id: string
  url: string
  title: string
  description: string
  type: GameOfferType
  publisher: string | null
  original_price: number | null
  original_price_fmt: string | null
  thumbnail: string | null
}

export interface GameOfferGuild {
  guild: string
  channel: string | null
  created_at: string
  updated_at: string
  storefronts: {
    [k: string]: {
      enabled: boolean
    }
  }
}

export const offerToMessage = (offer: GameOffer, t: LocalizedTranslateFunction): { embed: EmbedBuilder, component: ActionRowBuilder<ButtonBuilder> } => {
  const typeMap: Partial<Record<GameOfferType, string>> = {
    game: t('offers.embed.fields.type.value.game'),
    dlc: t('offers.embed.fields.type.value.dlc'),
    bundle: t('offers.embed.fields.type.value.bundle')
  };

  const embed = new EmbedBuilder()
    .setTitle(t('offers.embed.title', { game: offer.title, storefront: offer.storefront }))
    .setDescription(offer.description)
    .setURL(offer.url)
    .setColor(MESSAGE_EMBED_COLOR)
    .setFields(
      { name: t('offers.embed.fields.type.name'), value: typeMap[offer.type] || t('offers.embed.fields.type.value.other'), inline: true },
      { name: t('offers.embed.fields.publisher.name'), value: offer.publisher || t('offers.embed.fields.publisher.name.unknown'), inline: true },
      { name: t('offers.embed.fields.price.name'), value: offer.original_price_fmt || t('offers.embed.fields.price.name.unknown'), inline: true },
    );

  if (offer.thumbnail) {
    embed.setImage(offer.thumbnail);
  }

  const component = new ActionRowBuilder<ButtonBuilder>()
    .setComponents(
      new ButtonBuilder().setEmoji('🕹️').setStyle(ButtonStyle.Link).setURL(offer.url).setLabel(t('offers.buttons.get.label', { storefront: offer.storefront }))
    );

  return { embed, component };
};
