import OffersCommand from './OffersCommand';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getCurrentGameOffers } from '../features/gameOffers/functions/getCurrentGameOffers';
import { MESSAGE_EMBED_COLOR } from '../config/constants';

jest.mock('../features/gameOffers/functions/getCurrentGameOffers', () => {
  return {
    getCurrentGameOffers: jest.fn().mockResolvedValue([{
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
    }])
  };
});

jest.mock('../features/gameOffers/functions/getStorefronts', () => {
  return {
    getStorefronts: jest.fn().mockResolvedValue(['Steam', 'EpicGames'])
  };
});

describe('Commands > OffersCommand', () => {
  const client = {} as ExtendedClient;

  it('should be defined.', () => {
    expect(OffersCommand).toBeDefined();
  });

  describe('constructor', () => {
    it('should set the appropriate values.', () => {
      const command = new OffersCommand(client);
      expect(command.name).toBe('offers');
    });
  });

  describe('run()', () => {
    const command = new OffersCommand(client);
    const interaction = {
      reply: jest.fn(),
      followUp: jest.fn(),
      locale: 'en-US'
    } as unknown as ChatInputCommandInteraction;

    it('should reply with the empty message if no offers are available.', async () => {
      (getCurrentGameOffers as jest.Mock).mockResolvedValueOnce([]);
      await command.run(interaction);

      expect(interaction.reply).toHaveBeenCalledWith({ content: 'There are currently no offers in any of the following storefronts: Steam, EpicGames.' });
    });

    it('should reply with start message.', async () => {
      await command.run(interaction);
      expect(interaction.reply).toHaveBeenCalledWith({ content: "Here's a list of the currently available offers." });
    });

    it('should send an embed and component for each game.', async () => {
      const expectedEmbed = new EmbedBuilder()
        .setTitle('Drawful 2 on Steam')
        .setDescription('For 3-8 players and an audience of thousands! Your phones or tablets are your controllers! The game of terrible drawings and hilariously wrong answers.',)
        .setURL('https://store.steampowered.com/app/442070/Drawful_2/?snr=1_7_7_2300_150_1')
        .setColor(MESSAGE_EMBED_COLOR)
        .setFields(
          { name: 'Type', value: '👾️ Game', inline: true },
          { name: 'Publisher', value: 'Jackbox Games', inline: true },
          { name: 'Original Price', value: '$5.79 USD', inline: true },
        )
        .setImage('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/442070/header.jpg?t=1721927113');

      const expectedComponent = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
          new ButtonBuilder().setEmoji('🕹️').setStyle(ButtonStyle.Link).setURL('https://store.steampowered.com/app/442070/Drawful_2/?snr=1_7_7_2300_150_1').setLabel('Get it on Steam!')
        );

      await command.run(interaction);
      expect(interaction.followUp).toHaveBeenCalledWith({ embeds: [expectedEmbed], components: [expectedComponent] });
    });
  });
});
