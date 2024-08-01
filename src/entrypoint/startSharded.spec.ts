import { ShardingManager } from 'discord.js';
import EventEmitter from 'events';
import logger from '@moonstar-x/logger';

const manager = new EventEmitter() as unknown as ShardingManager;
manager.spawn = jest.fn();

jest.mock('../config/app', () => {
  return {
    DISCORD_TOKEN: 'token'
  };
});

jest.mock('discord.js', () => {
  return {
    ShardingManager: jest.fn().mockReturnValue(manager)
  };
});

jest.mock('@moonstar-x/logger');

describe('Entrypoint > Start Sharded', () => {
  const load = async () => {
    jest.isolateModules(() => {
      require('./startSharded');
    });
    await Promise.resolve();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should spawn manager.', async () => {
    await load();
    expect(manager.spawn).toHaveBeenCalledWith({ amount: 'auto' });
  });

  it('should register manager.shardCreate event handler.', async () => {
    await load();
    (manager as unknown as EventEmitter).emit('shardCreate', { id: '123' });

    expect(logger.info).toHaveBeenCalledWith('Launched shard with ID: 123.');
  });
});
