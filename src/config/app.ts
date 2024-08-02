import 'dotenv/config';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;

export const REDIS_URI = process.env.REDIS_URI!;

export const POSTGRES_HOST = process.env.POSTGRES_HOST!;
export const POSTGRES_PORT = process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432;
export const POSTGRES_USER = process.env.POSTGRES_USER!;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD!;
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE!;
export const POSTGRES_MAX_SHARD_CONNECTIONS = process.env.POSTGRES_MAX_SHARD_CONNECTIONS ? parseInt(process.env.POSTGRES_MAX_SHARD_CONNECTIONS, 10) : 15;
