import { createClient } from 'redis';
import { REDIS_URI } from '../../config/app';

export const createRedisClient = () => {
  return createClient({ url: REDIS_URI });
};

export type WithRedisFunction<TResult = unknown> = (client: ReturnType<typeof createRedisClient>) => Promise<TResult>;

export const withRedis = async <TResult = unknown>(fn: WithRedisFunction<TResult>) => {
  const client = createRedisClient();
  await client.connect();

  const result = await fn(client);

  await client.disconnect();
  return result;
};
