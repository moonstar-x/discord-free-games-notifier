import { updateOrCreateGuildChannel } from './updateOrCreateGuildChannel';
import { db } from '../../../services/database/client';

jest.mock('../../../services/database/client');

describe('Features > GameOffers > Functions > UpdateOrCreateGuildChannel', () => {
  const guildId = '1267881983548063785';
  const channelId = '1267881984642908346';

  beforeAll(() => {
    (db.any as jest.Mock).mockImplementation(() => Promise.resolve());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(updateOrCreateGuildChannel).toBeDefined();
  });

  it('should return undefined.', async () => {
    const result = await updateOrCreateGuildChannel(guildId, channelId);
    expect(result).toBeUndefined();
  });
});
