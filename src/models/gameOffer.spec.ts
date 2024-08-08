import { GameOffer, offerToMessage } from './gameOffer';
import { getTranslator } from '../i18n/translate';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { MESSAGE_EMBED_COLOR } from '../config/constants';

describe('Models > GameOffer', () => {
  describe('offerToMessage()', () => {
    const t = getTranslator('en-US');
    const offer: GameOffer = {
      storefront: 'Steam',
      id: '442070',
      url: 'https://store.steampowered.com/app/442070/Drawful_2/?snr=1_7_7_2300_150_1',
      title: 'Drawful 2',
      description: 'For 3-8 players and an audience of thousands! Your phones or tablets are your controllers! The game of terrible drawings and hilariously wrong answers.',
      type: 'game',
      publisher: 'Jackbox Games',
      original_price: 5.79,
      original_price_fmt: '$5.79 USD',
      thumbnail: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/442070/header.jpg?t=1721927113'
    };

    it('should be defined.', () => {
      expect(offerToMessage).toBeDefined();
    });

    it('should return the correct embed when all values are provided.', () => {
      const { embed } = offerToMessage(offer, t);

      const expectedEmbed = new EmbedBuilder()
        .setTitle('Drawful 2 on Steam')
        .setDescription(offer.description)
        .setURL(offer.url)
        .setColor(MESSAGE_EMBED_COLOR)
        .setFields(
          { name: 'Type', value: '👾️ Game', inline: true },
          { name: 'Publisher', value: offer.publisher!, inline: true },
          { name: 'Original Price', value: offer.original_price_fmt!, inline: true },
        )
        .setImage(offer.thumbnail);

      expect(embed).toStrictEqual(expectedEmbed);
    });

    it('should return the correct embed with default values if missing.', () => {
      const missingOffer: GameOffer = { ...offer, type: 'other', publisher: null, original_price_fmt: null, thumbnail: null };
      const { embed } = offerToMessage(missingOffer, t);

      const expectedEmbed = new EmbedBuilder()
        .setTitle('Drawful 2 on Steam')
        .setDescription(offer.description)
        .setURL(offer.url)
        .setColor(MESSAGE_EMBED_COLOR)
        .setFields(
          { name: 'Type', value: '❓ Other', inline: true },
          { name: 'Publisher', value: 'N/A', inline: true },
          { name: 'Original Price', value: 'N/A', inline: true },
        );

      expect(embed).toStrictEqual(expectedEmbed);
    });

    it('should return the correct component.', () => {
      const { component } = offerToMessage(offer, t);

      const expectedComponent = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
          new ButtonBuilder().setEmoji('🕹️').setStyle(ButtonStyle.Link).setURL(offer.url).setLabel('Get it on Steam!')
        );

      expect(component).toStrictEqual(expectedComponent);
    });
  });
});
