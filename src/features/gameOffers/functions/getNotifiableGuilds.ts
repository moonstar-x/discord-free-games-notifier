import { db } from '../../../services/database/client';
import { NotifiableGuild } from '../../../models/gameOffer';

export const getNotifiableGuilds = async (storefront: string): Promise<NotifiableGuild[]> => {
  const query = 'SELECT get_notifiable_guilds($1) AS result';
  const result = await db.one<{ result: NotifiableGuild[] }>(query, [storefront]);

  return result.result;
};
