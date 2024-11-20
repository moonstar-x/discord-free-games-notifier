import { getCurrentGameOffers } from './getCurrentGameOffers';
import { createRedisClient } from '../../../services/redis/client';

jest.mock('../../../services/redis/client');

describe('Features > GameOffers > Functions > GetCurrentGameOffers', () => {
  const client = createRedisClient();

  const gameOffer = {
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

  beforeAll(() => {
    (client.keys as jest.Mock).mockReturnValue([1, 2]);
    (client.mGet as jest.Mock).mockReturnValue([JSON.stringify(gameOffer), null]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    (client.keys as jest.Mock).mockReset();
    (client.mGet as jest.Mock).mockReset();
  });

  describe('getCurrentGameOffers()', () => {
    it('should be defined.', () => {
      expect(getCurrentGameOffers).toBeDefined();
    });

    it('should return game offers without null.', async () => {
      const result = await getCurrentGameOffers();
      expect(result).toStrictEqual([gameOffer]);
    });

    it('should return empty array if no offers exist.', async () => {
      (client.keys as jest.Mock).mockResolvedValueOnce([]);

      const result = await getCurrentGameOffers();
      expect(result).toStrictEqual([]);
    });
  });
});
