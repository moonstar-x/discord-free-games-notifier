import { withRedis } from '../../../services/redis/client';
import { GameOffer } from '../../../models/gameOffer';

export const getCurrentGameOffers = (): Promise<GameOffer[]> => {
  return withRedis(async (client) => {
    const keys = await client.keys('offer:*');
    if (!keys.length) {
      return [];
    }

    const items = await client.mGet(keys);
    return items
      .filter((item) => item !== null)
      .map((item: string) => JSON.parse(item));
  });
};
