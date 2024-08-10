import { PresenceManager } from './PresenceManager';
import { ExtendedClient } from '../client/ExtendedClient';
import { PresenceResolver } from './PresenceResolver';
import { ActivityType } from 'discord.js';
import logger from '@moonstar-x/logger';

jest.mock('@moonstar-x/logger');

describe('Base > Presence > PresenceManager', () => {
  describe('class PresenceManager', () => {
    const client = {
      user: {
        setPresence: jest.fn()
      }
    } as unknown as ExtendedClient;
    const resolver = {
      getRandom: jest.fn().mockResolvedValue('presence')
    } as unknown as PresenceResolver;

    beforeAll(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      jest.clearAllTimers();
    });

    it('should be defined.', () => {
      expect(PresenceManager).toBeDefined();
    });

    describe('constructor', () => {
      it('should set the provided options.', () => {
        const manager = new PresenceManager(client, resolver, {
          status: 'idle',
          type: ActivityType.Competing,
          afk: true
        });

        expect(manager.options.status).toBe('idle');
        expect(manager.options.type).toBe(ActivityType.Competing);
        expect(manager.options.afk).toBe(true);
      });

      it('should set the default options.', () => {
        const manager = new PresenceManager(client, resolver);

        expect(manager.options.status).toBe('online');
        expect(manager.options.type).toBe(ActivityType.Playing);
        expect(manager.options.afk).toBe(false);
      });
    });

    describe('setRefreshInterval()', () => {
      let manager: PresenceManager;
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval', undefined as never);

      beforeEach(async () => {
        if (manager) {
          await manager.setRefreshInterval(null);
        }
        manager = new PresenceManager(client, resolver);
      });

      afterAll(async () => {
        await manager.setRefreshInterval(null);
        (clearIntervalSpy as jest.Mock).mockRestore();
      });

      it('should throw if provided interval is inferior to minimum.', () => {
        expect(() => {
          return manager.setRefreshInterval(999);
        }).rejects.toThrow(new Error('Interval should be greater than 1000.'));
      });

      it('should set the interval handle.', async () => {
        await manager.setRefreshInterval(1001);
        expect((manager as unknown as { intervalHandle: number }).intervalHandle).not.toBeNull();
      });

      it('should clear the interval if already set and remove it if set to null.', async () => {
        await manager.setRefreshInterval(5000);
        const oldHandle = (manager as unknown as { intervalHandle: number }).intervalHandle;

        await manager.setRefreshInterval(null);
        expect(clearIntervalSpy).toHaveBeenCalledWith(oldHandle);
        expect((manager as unknown as { intervalHandle: number }).intervalHandle).toBeNull();
      });

      it('should clear the interval if already set and update the interval handle.', async () => {
        await manager.setRefreshInterval(5000);
        const oldHandle = (manager as unknown as { intervalHandle: number }).intervalHandle;

        await manager.setRefreshInterval(6000);
        expect(clearIntervalSpy).toHaveBeenCalledWith(oldHandle);
        expect((manager as unknown as { intervalHandle: number }).intervalHandle).not.toBe(oldHandle);
      });
    });

    describe('setPresence()', () => {
      const manager = new PresenceManager(client, resolver);

      it('should set presence with correct values.', () => {
        manager.setPresence('something');
        expect(client.user!.setPresence).toHaveBeenCalledWith({
          activities: [{
            name: 'something',
            type: ActivityType.Playing
          }],
          status: 'online',
          afk: false
        });
      });

      it('should log presence change.', () => {
        manager.setPresence('something');
        expect(logger.info).toHaveBeenCalledWith('Presence changed to: something');
      });

      it('should log error if presence change fails.', () => {
        const expectedError = new Error('Oops');
        (client.user!.setPresence as jest.Mock).mockImplementationOnce(() => {
          throw expectedError;
        });

        manager.setPresence('something');
        expect(logger.error).toHaveBeenCalledWith('Could not update client presence.');
        expect(logger.error).toHaveBeenCalledWith(expectedError);
      });
    });

    describe('update()', () => {
      const manager = new PresenceManager(client, resolver);

      it('should set presence with correct values.', async () => {
        await manager.update();
        expect(client.user!.setPresence).toHaveBeenCalledWith({
          activities: [{
            name: 'presence',
            type: ActivityType.Playing
          }],
          status: 'online',
          afk: false
        });
      });

      it('should log presence change.', async () => {
        await manager.update();
        expect(logger.info).toHaveBeenCalledWith('Presence changed to: presence');
      });

      it('should log error if presence change fails.', async () => {
        const expectedError = new Error('Oops');
        (client.user!.setPresence as jest.Mock).mockImplementationOnce(() => {
          throw expectedError;
        });

        await manager.update();
        expect(logger.error).toHaveBeenCalledWith('Could not update client presence.');
        expect(logger.error).toHaveBeenCalledWith(expectedError);
      });
    });
  });
});
