import { getGuild } from './getGuild';
import { db } from '../../../services/database/client';

jest.mock('../../../services/database/client');

describe('Features > GameOffers > Functions > GetGuild', () => {
  const guildId = '1267881983548063785';
  const guildData = {
    guild: '1267881983548063785',
    channel: null,
    locale: 'en-US',
    created_at: '2024-08-04T15:16:40.054841+00:00',
    updated_at: '2024-08-04T15:16:40.054841+00:00',
    storefronts: {
      EpicGames: {
        enabled: true
      },
      Steam: {
        enabled: true
      }
    }
  };

  beforeAll(() => {
    (db.one as jest.Mock).mockResolvedValue({ result: guildData });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(getGuild).toBeDefined();
  });

  it('should return the result.', async () => {
    const result = await getGuild(guildId);
    expect(result).toBe(guildData);
  });

  it('should return null if not found result.', async () => {
    (db.one as jest.Mock).mockResolvedValueOnce({ result: null });
    const result = await getGuild(guildId);

    expect(result).toBeNull();
  });
});
