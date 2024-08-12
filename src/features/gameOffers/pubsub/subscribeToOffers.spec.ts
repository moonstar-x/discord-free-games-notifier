import { subscribeToOffers } from './subscribeToOffers';
import { createRedisClient } from '../../../services/redis/client';
import logger from '@moonstar-x/logger';

jest.mock('../../../services/redis/client');
jest.mock('@moonstar-x/logger');

describe('Features > GameOffers > PubSub > SubscribeToOffers', () => {
  const client = createRedisClient();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    (client.subscribe as jest.Mock).mockReset();
  });

  describe('subscribeToOffers()', () => {
    const listener = jest.fn();

    it('should be defined.', () => {
      expect(subscribeToOffers).toBeDefined();
    });

    it('should return a unsubscribe function.', async () => {
      const unsubscribe = await subscribeToOffers(listener);
      await unsubscribe();

      expect(unsubscribe).toBeInstanceOf(Function);
      expect(client.disconnect).toHaveBeenCalled();
      expect(client.unsubscribe).toHaveBeenCalledWith('offers', expect.anything());
    });

    it('should subscribe to offers channel.', async () => {
      (client.subscribe as jest.Mock).mockImplementationOnce((_channel, fn) => {
        fn('{"data": 123}');
        return Promise.resolve();
      });
      await subscribeToOffers(listener);

      expect(client.subscribe).toHaveBeenCalledWith('offers', expect.anything());
      expect(listener).toHaveBeenCalledWith({ data: 123 });
    });

    it('should log error if subscribed value is invalid.', async () => {
      (client.subscribe as jest.Mock).mockImplementationOnce((_channel, fn) => {
        fn('invalid data');
        return Promise.resolve();
      });
      await subscribeToOffers(listener);

      expect(listener).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('Received invalid offer in subscription.');
      expect(logger.error).toHaveBeenCalledWith('invalid data');
    });
  });
});
