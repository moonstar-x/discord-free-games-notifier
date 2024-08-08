import { db } from '../../../services/database/client';
import { Locale } from '../../../i18n/translate';

export const updateOrCreateGuildLocale = async (guildId: string, locale: Locale): Promise<void> => {
  const query = 'SELECT update_or_create_guild_locale($1, $2)';
  await db.any(query, [guildId, locale]);
};
