import { setGuildGameOfferEnabled } from './setGuildGameOfferEnabled';
import { db } from '../../../services/database/client';

jest.mock('../../../services/database/client');

describe('Features > GameOffers > Functions > SetGuildGameOffersEnabled', () => {
  const guildId = '1267881983548063785';

  beforeAll(() => {
    (db.any as jest.Mock).mockImplementation(() => Promise.resolve());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(setGuildGameOfferEnabled).toBeDefined();
  });

  it('should return undefined.', async () => {
    const result = await setGuildGameOfferEnabled(guildId, 'EpicGames', true);
    expect(result).toBeUndefined();
  });
});
