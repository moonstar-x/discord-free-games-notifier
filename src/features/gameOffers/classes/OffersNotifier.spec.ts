import { OffersNotifier } from './OffersNotifier';
import { ExtendedClient } from '../../../base/client/ExtendedClient';
import { GameOffer, NotifiableGuild } from '../../../models/gameOffer';
import logger from '@moonstar-x/logger';
import { ChannelType, Guild, TextChannel } from 'discord.js';
import { deleteGuild } from '../functions/deleteGuild';

const triggerRef: { trigger: (() => Promise<void>) | null } = {
  trigger: null
};

jest.mock('../pubsub/subscribeToOffers', () => {
  const gameOffer: GameOffer = {
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

  return {
    subscribeToOffers: jest.fn().mockImplementation((fn) => {
      triggerRef.trigger = async () => await fn(gameOffer);
      return jest.fn().mockImplementation(() => Promise.resolve());
    })
  };
});

jest.mock('../functions/getNotifiableGuilds', () => {
  const notifiableGuild: NotifiableGuild = {
    guild: '1267881983548063785',
    channel: '1267881983548063786',
    locale: 'en-US'
  };

  return {
    getNotifiableGuilds: jest.fn().mockResolvedValue([notifiableGuild])
  };
});

jest.mock('../functions/deleteGuild', () => {
  return {
    deleteGuild: jest.fn().mockImplementation(() => Promise.resolve())
  };
});

jest.mock('@moonstar-x/logger');

describe('Features > GameOffers > Classes > OffersNotifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('class OffersNotifier', () => {
    const channel = {
      type: ChannelType.GuildText,
      send: jest.fn().mockImplementation(() => Promise.resolve())
    } as unknown as TextChannel;

    const guild = {
      name: 'Guild',
      shardId: 0,
      channels: {
        fetch: jest.fn().mockResolvedValue(channel)
      }
    } as unknown as Guild;

    const client = {
      guilds: {
        fetch: jest.fn().mockResolvedValue(guild)
      },
      shard: {
        ids: [0]
      }
    } as unknown as ExtendedClient;

    it('should be defined.', () => {
      expect(OffersNotifier).toBeDefined();
    });

    describe('subscribe()', () => {
      let notifier: OffersNotifier;

      beforeEach(() => {
        notifier = new OffersNotifier(client);
      });

      it('should set subscription.', async () => {
        expect((notifier as unknown as { subscription: unknown }).subscription).toBeNull();
        await notifier.subscribe();
        expect((notifier as unknown as { subscription: unknown }).subscription).not.toBeNull();
      });

      it('should call unsubscribe if called repeatedly.', async () => {
        await notifier.subscribe();
        const { subscription } = (notifier as unknown as { subscription: unknown });
        await notifier.subscribe();

        expect(subscription).toHaveBeenCalled();
      });
    });

    describe('subscription [handleOffer()]', () => {
      const notifier = new OffersNotifier(client);

      beforeAll(async () => {
        await notifier.subscribe();
      });

      it('should log new offer.', async () => {
        await triggerRef.trigger!();
        expect(logger.info).toHaveBeenCalledWith('Received new offer from Redis: Drawful 2 on Steam');
      });

      it('should log warning if guild is not found.', async () => {
        (client.guilds.fetch as jest.Mock).mockRejectedValueOnce(null);
        await triggerRef.trigger!();

        expect(logger.warn).toHaveBeenCalledWith('Guild with id 1267881983548063785 does not exist anymore. Maybe the bot is no longer in it? Will remove from the database.');
      });

      it('should guild not found.', async () => {
        (client.guilds.fetch as jest.Mock).mockRejectedValueOnce(null);
        await triggerRef.trigger!();

        expect(deleteGuild).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith('Deleted guild data for 1267881983548063785.');
      });

      it('should log error if guild delete fails..', async () => {
        const expectedError = new Error('Oops');
        (client.guilds.fetch as jest.Mock).mockRejectedValueOnce(null);
        (deleteGuild as jest.Mock).mockRejectedValueOnce(expectedError);

        await triggerRef.trigger!();

        expect(logger.error).toHaveBeenCalledWith('Could not delete guild data for 1267881983548063785.');
        expect(logger.error).toHaveBeenCalledWith(expectedError);
      });

      it('should send the message if channel is found and is GuildText.', async () => {
        await triggerRef.trigger!();
        expect(channel.send).toHaveBeenCalledWith({ embeds: [expect.anything()], components: [expect.anything()] });
      });

      it('should send the message if channel is found and is GuildAnnouncement.', async () => {
        Object.defineProperty(channel, 'type', { value: ChannelType.GuildAnnouncement });

        await triggerRef.trigger!();
        expect(channel.send).toHaveBeenCalledWith({ embeds: [expect.anything()], components: [expect.anything()] });

        Object.defineProperty(channel, 'type', { value: ChannelType.GuildText });
      });

      it('should not send the message if guild is not in the same shard.', async () => {
        guild.shardId = 1;
        await triggerRef.trigger!();

        expect(channel.send).not.toHaveBeenCalled();

        guild.shardId = 0;
      });

      it('should not send the message if channel is null.', async () => {
        (guild.channels.fetch as jest.Mock).mockResolvedValueOnce(null);
        await triggerRef.trigger!();

        expect(channel.send).not.toHaveBeenCalled();
      });

      it('should not send the message if channel fetching fails.', async () => {
        (guild.channels.fetch as jest.Mock).mockRejectedValueOnce(null);
        await triggerRef.trigger!();

        expect(channel.send).not.toHaveBeenCalled();
      });

      it('should not send the message if channel is GuildText.', async () => {
        Object.defineProperty(channel, 'type', { value: ChannelType.GuildForum });
        await triggerRef.trigger!();

        expect(channel.send).not.toHaveBeenCalled();

        Object.defineProperty(channel, 'type', { value: ChannelType.GuildText });
      });

      it('should log error if something fails in sending.', async () => {
        const expectedError = new Error('Oops!');
        (channel.send as jest.Mock).mockRejectedValueOnce(expectedError);

        await triggerRef.trigger!();

        expect(logger.error).toHaveBeenCalledWith('Could not notify guild Guild about offer Drawful 2 on Steam.');
        expect(logger.error).toHaveBeenCalledWith(expectedError);
      });
    });
  });
});
