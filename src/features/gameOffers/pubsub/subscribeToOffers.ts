import { createRedisClient } from '../../../services/redis/client';
import logger from '@moonstar-x/logger';
import { GameOffer } from '../../../models/gameOffer';

export type OffersSubscriberFunction = (offer: GameOffer) => void;
export type UnsubscribeFunction = () => Promise<void>;

export const subscribeToOffers = async (fn: OffersSubscriberFunction): Promise<UnsubscribeFunction> => {
  const client = createRedisClient();
  await client.connect();

  const listener = (data: string) => {
    try {
      const parsed: GameOffer = JSON.parse(data);
      fn(parsed);
    } catch (error) {
      logger.error('Received invalid offer in subscription.');
      logger.error(data);
    }
  };

  await client.subscribe('offers', listener);
  return async () => {
    await client.unsubscribe('offers', listener);
    await client.disconnect();
  };
};
