import { ShardingManager } from 'discord.js';
import EventEmitter from 'events';
import logger from '@moonstar-x/logger';
import { runMigrations } from '../app/migration';

const manager = new EventEmitter() as unknown as ShardingManager;
manager.spawn = jest.fn();

jest.mock('../config/app', () => {
  return {
    DISCORD_TOKEN: 'token'
  };
});

jest.mock('../app/migration', () => {
  return {
    runMigrations: jest.fn().mockImplementation(() => Promise.resolve())
  };
});

jest.mock('discord.js', () => {
  return {
    ShardingManager: jest.fn().mockReturnValue(manager)
  };
});

jest.mock('@moonstar-x/logger');

describe('Entrypoint > Start Sharded (Dev)', () => {
  const load = async () => {
    jest.isolateModules(() => {
      require('./startShardedDev');
    });
    await Promise.resolve();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call migrations.', async () => {
    await load();
    expect(runMigrations).toHaveBeenCalled();
  });

  it('should spawn manager.', async () => {
    await load();
    expect(manager.spawn).toHaveBeenCalledWith({ amount: 2 });
  });

  it('should register manager.shardCreate event handler.', async () => {
    await load();
    (manager as unknown as EventEmitter).emit('shardCreate', { id: '123' });

    expect(logger.info).toHaveBeenCalledWith('Launched shard with ID: 123.');
  });
});
