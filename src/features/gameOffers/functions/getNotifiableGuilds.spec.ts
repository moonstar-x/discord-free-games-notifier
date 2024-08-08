import { getNotifiableGuilds } from './getNotifiableGuilds';
import { db } from '../../../services/database/client';

jest.mock('../../../services/database/client');

describe('Features > GameOffers > Functions > GetNotifiableGuilds', () => {
  const guildData = {
    guild: '1267881983548063785',
    channel: null,
    locale: 'en-US'
  };

  beforeAll(() => {
    (db.one as jest.Mock).mockResolvedValue({ result: guildData });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(getNotifiableGuilds).toBeDefined();
  });

  it('should return the result.', async () => {
    const result = await getNotifiableGuilds('Steam');
    expect(result).toBe(guildData);
  });

  it('should return null if not found result.', async () => {
    (db.one as jest.Mock).mockResolvedValueOnce({ result: [] });
    const result = await getNotifiableGuilds('Steam');

    expect(result).toStrictEqual([]);
  });
});
