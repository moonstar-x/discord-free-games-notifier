import { db } from '../../../services/database/client';

export const updateOrCreateGuildChannel = async (guildId: string, channelId: string): Promise<void> => {
  const query = 'SELECT update_or_create_guild_channel($1, $2)';
  await db.any(query, [guildId, channelId]);
};
