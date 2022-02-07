const AbstractProvider = require('../../../src/classes/providers/AbstractProvider');
const EpicGamesProvider = require('../../../src/classes/providers/EpicGamesProvider');
const Cache = require('../../../src/classes/Cache');
const axios = require('axios');
const logger = require('@greencoast/logger');

jest.mock('axios');
jest.mock('@greencoast/logger');

jest.spyOn(Date, 'now').mockReturnValue(1000);

const mockedGame = {
  title: 'game',
  productSlug: 'slug',
  price: {
    totalPrice: {
      discountPrice: 0
    }
  },
  promotions: {
    promotionalOffers: [
      '1 promotion'
    ]
  }
};

const mockedData = {
  data: {
    Catalog: {
      searchStore: {
        elements: [
          mockedGame
        ]
      }
    }
  }
};

describe('Classes - Providers - EpicGamesProvider', () => {
  let provider;

  beforeAll(() => {
    axios.get.mockImplementation(() => Promise.resolve({ data: mockedData }));
  });

  beforeEach(() => {
    provider = new EpicGamesProvider();
    axios.get.mockClear();
    logger.error.mockClear();
  });

  it('should be instance of AbstractProvider.', () => {
    expect(provider).toBeInstanceOf(AbstractProvider);
  });

  it('should contain a name property.', () => {
    expect(provider).toHaveProperty('name', 'Epic Games');
  });

  it('should contain a cache property.', () => {
    expect(provider).toHaveProperty('cache');
    expect(provider.cache).toBeInstanceOf(Cache);
  });

  describe('getData()', () => {
    it('should return a Promise.', () => {
      expect(provider.getData()).toBeInstanceOf(Promise);
    });

    it('should resolve a data object.', () => {
      return provider.getData()
        .then((data) => {
          expect(data).toBe(mockedData);
        });
    });

    it('should reject if axios.get rejects.', () => {
      const expectedError = new Error('Oops');
      axios.get.mockRejectedValueOnce(expectedError);
      expect.assertions(1);
      
      return provider.getData()
        .catch((error) => {
          expect(error).toBe(expectedError);
        });
    });
  });

  describe('getOffers()', () => {
    let expectedOffer;

    beforeAll(() => {
      expectedOffer = {
        provider: provider.name,
        game: mockedGame.title,
        url: `https://epicgames.com/store/product/${mockedGame.productSlug}/home`,
        id: mockedGame.productSlug,
        lastFetched: 1000
      };
    });

    it('should return a Promise.', () => {
      expect(provider.getOffers()).toBeInstanceOf(Promise);
    });

    it('should resolve an array of GameOffers.', () => {
      return provider.getOffers()
        .then((offers) => {
          expect(offers).toBeInstanceOf(Array);
          expect(offers).toContainEqual(expectedOffer);
        });
    });

    it('should resolve an array of correct GameOffers if productSlug ends with /home.', () => {
      axios.get.mockImplementationOnce(() => {
        const newMockedData = {
          ...mockedData,
          productSlug: 'slug/home'
        };

        return Promise.resolve({ data: newMockedData });
      });

      return provider.getOffers()
        .then((offers) => {
          expect(offers).toBeInstanceOf(Array);
          expect(offers).toContainEqual(expectedOffer);
        });
    });

    it('should resolve null if getData rejects.', () => {
      axios.get.mockRejectedValueOnce(new Error());
      return provider.getOffers()
        .then((offers) => {
          expect(offers).toBeNull();
        });
    });

    it('should log that the fetch did not work if getData rejects.', () => {
      const expectedError = new Error('Oops');
      axios.get.mockRejectedValueOnce(expectedError);
      
      return provider.getOffers()
        .then(() => {
          expect(logger.error).toBeCalledTimes(2);
          expect(logger.error).toHaveBeenCalledWith(`Could not fetch offers from ${provider.name}!`);
          expect(logger.error).toHaveBeenCalledWith(expectedError);
        });
    });

    it('should read from the cache if called repeatedly.', () => {
      return provider.getOffers()
        .then(() => {
          return provider.getOffers()
            .then((offers) => {
              expect(axios.get).toBeCalledTimes(1);
              expect(offers).toContainEqual(expectedOffer);
            });
        });
    });
  });
});
