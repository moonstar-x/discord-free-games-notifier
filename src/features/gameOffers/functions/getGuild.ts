import { db } from '../../../services/database/client';
import { GameOfferGuild } from '../../../models/gameOffer';

export const getGuild = async (guildId: string): Promise<GameOfferGuild | null> => {
  const query = 'SELECT get_guild($1) AS result';
  const result = await db.one<{ result: GameOfferGuild | null }>(query, [guildId]);

  return result.result;
};
