const OffersCache = require('../../src/classes/OffersCache');
const { clientMock } = require('../../__mocks__/discordMocks');

const nowSpy = jest.spyOn(Date, 'now');

describe('Classes - OffersCache', () => {
  let cache;

  beforeEach(() => {
    cache = new OffersCache(clientMock.dataProvider);

    clientMock.dataProvider.getGlobal.mockClear();
    clientMock.dataProvider.setGlobal.mockClear();
  });

  describe('isOfferCached()', () => {
    it('should return true if offer is in the cache.', () => {
      clientMock.dataProvider.getGlobal.mockResolvedValueOnce([{ id: '123' }]);

      return cache.isOfferCached({ id: '123' })
        .then((result) => {
          expect(result).toBe(true);
        });
    });

    it('should return false if offer is not in the cache.', () => {
      clientMock.dataProvider.getGlobal.mockResolvedValueOnce([{ id: '234' }]);

      return cache.isOfferCached({ id: '123' })
        .then((result) => {
          expect(result).toBe(false);
        });
    });
  });

  describe('update()', () => {
    it('should update the cache with merged offers.', () => {
      const expectedOffers = [{ id: '123' }, { id: '234' }];
      jest.spyOn(cache, 'mergeOffers').mockReturnValueOnce(expectedOffers);

      return cache.update()
        .then(() => {
          expect(clientMock.dataProvider.setGlobal).toHaveBeenCalledWith('notified', expectedOffers);
        });
    });
  });

  describe('mergeOffers()', () => {
    it('should return an array containing the past offers that are still valid.', () => {
      nowSpy.mockReturnValue(1000);
      
      const cachedOffers = [
        {
          id: '123',
          lastFetched: 2000
        },
        {
          id: '234',
          lastFetched: 3000
        }
      ];

      const merged = cache.mergeOffers([], cachedOffers);

      expect(merged).toContain(cachedOffers[0]);
      expect(merged).toContain(cachedOffers[1]);
    });

    it('should return an array without invalid offers.', () => {
      nowSpy.mockReturnValue(100000000000);
      
      const cachedOffers = [
        {
          id: '123',
          lastFetched: 100000000000
        },
        {
          id: '234',
          lastFetched: 100
        }
      ];

      const merged = cache.mergeOffers([], cachedOffers);

      expect(merged).toContain(cachedOffers[0]);
      expect(merged).not.toContain(cachedOffers[1]);
    });

    it('should return an array with all new offers.', () => {
      const currentOffers = [
        {
          id: '123',
          lastFetched: 100000000000
        },
        {
          id: '234',
          lastFetched: 100
        }
      ];

      const merged = cache.mergeOffers(currentOffers, []);

      expect(merged).toContain(currentOffers[0]);
      expect(merged).toContain(currentOffers[1]);
    });

    it('should return an array where the new offers override the old ones.', () => {
      const currentOffers = [
        {
          id: '123',
          lastFetched: 2222222222
        },
        {
          id: '234',
          lastFetched: 100
        }
      ];
      const cachedOffer = {
        id: '123',
        lastFetched: 11111111111
      };

      const merged = cache.mergeOffers(currentOffers, [cachedOffer]);

      expect(merged).toContain(currentOffers[0]);
      expect(merged).toContain(currentOffers[1]);
      expect(merged).not.toContain(cachedOffer);
    });
  });
});
