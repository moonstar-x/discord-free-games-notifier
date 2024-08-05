import { deleteGuild } from './deleteGuild';
import { db } from '../../../services/database/client';

jest.mock('../../../services/database/client');

describe('Features > GameOffers > Functions > DeleteGuild', () => {
  const guildId = '1267881983548063785';

  beforeAll(() => {
    (db.any as jest.Mock).mockImplementation(() => Promise.resolve());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(deleteGuild).toBeDefined();
  });

  it('should return undefined.', async () => {
    const result = await deleteGuild(guildId);
    expect(result).toBeUndefined();
  });
});
