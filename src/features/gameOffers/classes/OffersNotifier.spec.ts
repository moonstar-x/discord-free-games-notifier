import { OffersNotifier } from './OffersNotifier';
import { ExtendedClient } from '../../../base/client/ExtendedClient';
import { GameOffer } from '../../../models/gameOffer';
import logger from '@moonstar-x/logger';

const triggerRef: { trigger: (() => void) | null } = {
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
      triggerRef.trigger = () => fn(gameOffer);
      return jest.fn().mockImplementation(() => Promise.resolve());
    })
  };
});

jest.mock('@moonstar-x/logger');

describe('Features > GameOffers > Classes > OffersNotifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('class OffersNotifier', () => {
    const client = {} as ExtendedClient;

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

      it('should log new offer.', () => {
        triggerRef.trigger!();
        expect(logger.info).toHaveBeenCalledWith('Received new offer from Redis: Drawful 2 on Steam');
      });
    });
  });
});
