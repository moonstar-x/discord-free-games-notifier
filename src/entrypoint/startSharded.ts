import path from 'path';
import { ShardingManager } from 'discord.js';
import logger from '@moonstar-x/logger';
import { DISCORD_TOKEN } from '../config/app';

// Note: This works only when built, not in TypeScript.
const startScript = path.join(__dirname, `./start.js`);

const manager = new ShardingManager(startScript, { token: DISCORD_TOKEN });

manager.on('shardCreate', (shard) => {
  logger.info(`Launched shard with ID: ${shard.id}.`);
});

manager.spawn({ amount: 'auto' });