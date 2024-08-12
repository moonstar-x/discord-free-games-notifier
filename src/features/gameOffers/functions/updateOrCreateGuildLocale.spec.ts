import { updateOrCreateGuildLocale } from './updateOrCreateGuildLocale';
import { db } from '../../../services/database/client';
import { Locale } from '../../../i18n/translate';

jest.mock('../../../services/database/client');

describe('Features > GameOffers > Functions > UpdateOrCreateGuildLocale', () => {
  const guildId = '1267881983548063785';
  const locale: Locale = 'en-US';

  beforeAll(() => {
    (db.any as jest.Mock).mockImplementation(() => Promise.resolve());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(updateOrCreateGuildLocale).toBeDefined();
  });

  it('should return undefined.', async () => {
    const result = await updateOrCreateGuildLocale(guildId, locale);
    expect(result).toBeUndefined();
  });
});
