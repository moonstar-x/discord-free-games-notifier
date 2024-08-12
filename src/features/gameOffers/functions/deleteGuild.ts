import { db } from '../../../services/database/client';

export const deleteGuild = async (guildId: string): Promise<void> => {
  const query = 'SELECT delete_guild($1)';
  await db.any(query, [guildId]);
};
