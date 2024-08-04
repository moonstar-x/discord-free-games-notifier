import { getStorefronts } from './getStorefronts';
import { db } from '../../../services/database/client';

jest.mock('../../../services/database/client');

describe('Features > GameOffers > Functions > GetStorefronts', () => {
  const storefronts = ['EpicGames', 'Steam'];

  beforeAll(() => {
    (db.one as jest.Mock).mockResolvedValue({ result: storefronts });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(getStorefronts).toBeDefined();
  });

  it('should return the result.', async () => {
    const result = await getStorefronts();
    expect(result).toBe(storefronts);
  });

  it('should return empty array if not found result.', async () => {
    (db.one as jest.Mock).mockResolvedValueOnce({ result: null });
    const result = await getStorefronts();

    expect(result).toStrictEqual([]);
  });
});
