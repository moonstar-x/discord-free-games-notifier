import { db } from '../../../services/database/client';

export const setGuildGameOfferEnabled = async (guildId: string, storefront: string, enabled: boolean): Promise<void> => {
  const query = 'SELECT set_guild_game_offer_enabled($1, $2, $3) AS result';
  await db.any(query, [guildId, storefront, enabled]);
};
