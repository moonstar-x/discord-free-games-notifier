import { PresenceResolver } from './PresenceResolver';
import { ExtendedClient } from '../client/ExtendedClient';
import { ShardClientUtil } from 'discord.js';
import dayjs from 'dayjs';

dayjs.tz.setDefault('America/Guayaquil');
const dateGetTimeSpy = jest.spyOn(Date.prototype, 'getTime', undefined as never);

jest.mock('../../features/gameOffers/functions/getStorefronts', () => {
  return {
    getStorefronts: jest.fn().mockResolvedValue([1, 2])
  };
});

jest.mock('../../features/gameOffers/functions/getCurrentGameOffers', () => {
  return {
    getCurrentGameOffers: jest.fn().mockResolvedValue([1, 2])
  };
});

describe('Base > Presence > PresenceResolver', () => {
  beforeAll(() => {
    (dateGetTimeSpy as jest.Mock).mockReturnValue(1723224679000);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    (dateGetTimeSpy as jest.Mock).mockRestore();
  });

  describe('class PresenceResolver', () => {
    const clientShard = {
      fetchClientValues: jest.fn()
    } as unknown as ShardClientUtil;
    const client = {
      shard: null,
      guilds: {
        cache: {
          reduce: jest.fn().mockImplementation((fn, init) => fn(init, { memberCount: 50 })),
          size: 10
        }
      },
      registry: {
        size: jest.fn().mockReturnValue(5)
      },
      readyTimestamp: null,
      uptime: false
    } as unknown as ExtendedClient;
    const resolver = new PresenceResolver(client);

    it('should be defined.', () => {
      expect(PresenceResolver).toBeDefined();
    });

    describe('get()', () => {
      describe('n_guilds', () => {
        it('should return the number of guilds in a simple client.', async () => {
          client.shard = null;
          const result = await resolver.get('n_guilds');

          expect(result).toBe('in 10 servers!');
        });

        it('should return the number of guilds in a sharded client.', async () => {
          (clientShard.fetchClientValues as jest.Mock).mockResolvedValueOnce([5, 10, 15]);
          client.shard = clientShard;
          const result = await resolver.get('n_guilds');

          expect(result).toBe('in 30 servers!');
        });
      });

      describe('n_members', () => {
        it('should return the number of members in all guilds in a simple client.', async () => {
          client.shard = null;
          const result = await resolver.get('n_members');

          expect(result).toBe('with 50 users!');
        });

        it('should return the number of members in all guilds in a sharded client.', async () => {
          (clientShard.fetchClientValues as jest.Mock).mockResolvedValueOnce([[{ memberCount: 10 }, { memberCount: 10 }], [{ memberCount: 50 }]]);
          client.shard = clientShard;
          const result = await resolver.get('n_members');

          expect(result).toBe('with 70 users!');
        });
      });

      describe('n_commands', () => {
        it('should return the number of commands.', async () => {
          const result = await resolver.get('n_commands');
          expect(result).toBe('with 5 commands!');
        });
      });

      describe('n_storefronts', () => {
        it('should return the number of storefronts.', async () => {
          const result = await resolver.get('n_storefronts');
          expect(result).toBe('on 2 storefronts!');
        });
      });

      describe('n_offers', () => {
        it('should return the number of storefronts.', async () => {
          const result = await resolver.get('n_offers');
          expect(result).toBe('with 2 offers!');
        });
      });

      describe('time_cur', () => {
        it('should return the formatted current time.', async () => {
          const result = await resolver.get('time_cur');
          expect(result).toBe('Current time: 12:31:19 PM');
        });
      });

      describe('time_ready', () => {
        it('should return the formatted ready time if exists.', async () => {
          client.readyTimestamp = 1723224699000;
          const result = await resolver.get('time_ready');
          expect(result).toBe('Up since: Fri, 09/08/24 @12:31:39 PM');
        });

        it('should return the formatted now time if ready time does not exist.', async () => {
          client.readyTimestamp = null;
          const result = await resolver.get('time_ready');
          expect(result).toBe('Up since: Fri, 09/08/24 @12:31:19 PM');
        });
      });

      describe('uptime', () => {
        it('should return the formatted uptime if exists.', async () => {
          Object.defineProperty(client, 'uptime', { value: 333000 });
          const result = await resolver.get('uptime');
          expect(result).toBe('Up for: 6 minutes');
        });

        it('should return 0 minutes if uptime does not exist.', async () => {
          Object.defineProperty(client, 'uptime', { value: false });
          const result = await resolver.get('uptime');
          expect(result).toBe('Up for: 0 minutes');
        });
      });

      it('should throw if invalid name is provided.', () => {
        expect(() => resolver.get('whatever' as 'n_guilds')).rejects.toThrow(new Error('Invalid presence name provided.'));
      });
    });

    describe('getRandom()', () => {
      beforeAll(() => {
        client.shard = null;
      });

      it('should return a random text.', async () => {
        const result = await resolver.getRandom();
        expect(typeof result).toBe('string');
      });
    });
  });
});
