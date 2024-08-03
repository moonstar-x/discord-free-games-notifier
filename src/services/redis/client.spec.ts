import { createRedisClient, withRedis } from './client';
import redis from 'redis';

jest.unmock('./client');

jest.mock('redis');

jest.mock('../../config/app', () => {
  return {
    REDIS_URI: 'redis://localhost:6379'
  };
});

describe('Services > Redis > Client', () => {
  describe('createRedisClient()', () => {
    it('should be defined.', () => {
      expect(createRedisClient).toBeDefined();
    });

    it('should return a Redis client with the correct URI.', () => {
      createRedisClient();
      expect(redis.createClient).toHaveBeenCalledWith({ url: 'redis://localhost:6379' });
    });
  });

  describe('withRedis()', () => {
    it('should be defined.', () => {
      expect(withRedis).toBeDefined();
    });

    it('should call client connect and disconnect.', async () => {
      const client = createRedisClient();
      await withRedis(() => Promise.resolve());

      expect(client.connect).toHaveBeenCalled();
      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should return the function result.', async () => {
      const result = await withRedis(() => Promise.resolve(123));
      expect(result).toBe(123);
    });
  });
});
