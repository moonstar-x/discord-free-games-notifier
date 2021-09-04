const AbstractProvider = require('../../../src/classes/providers/AbstractProvider');
const SteamProvider = require('../../../src/classes/providers/SteamProvider');
const Cache = require('../../../src/classes/Cache');
const axios = require('axios');
const logger = require('@greencoast/logger');
const fs = require('fs');
const path = require('path');

jest.mock('axios');
jest.mock('@greencoast/logger');

jest.spyOn(Date, 'now').mockReturnValue(1000);

const mockedHTML = fs.readFileSync(path.join(__dirname, '../../../__mocks__/steamPage'));

describe('Classes - Providers - SteamProvider', () => {
  let provider;

  beforeAll(() => {
    axios.get.mockImplementation(() => Promise.resolve({ data: mockedHTML }));
  });

  beforeEach(() => {
    provider = new SteamProvider();
    axios.get.mockClear();
    logger.error.mockClear();
  });

  it('should be instance of AbstractProvider.', () => {
    expect(provider).toBeInstanceOf(AbstractProvider);
  });

  it('should contain a name property.', () => {
    expect(provider).toHaveProperty('name', 'Steam');
  });

  it('should contain a cache property.', () => {
    expect(provider).toHaveProperty('cache');
    expect(provider.cache).toBeInstanceOf(Cache);
  });

  describe('getData()', () => {
    it('should return a Promise.', () => {
      expect(provider.getData()).toBeInstanceOf(Promise);
    });

    it('should resolve raw HTML.', () => {
      return provider.getData()
        .then((data) => {
          expect(data).toBe(mockedHTML);
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

    describe('getOffers()', () => {
      let expectedOffer;
  
      beforeAll(() => {
        expectedOffer = {
          provider: provider.name,
          game: 'Battlefield 1 Shortcut Kit: Infantry Bundle',
          url: 'https://store.steampowered.com/app/1314764/Battlefield_1_Shortcut_Kit_Infantry_Bundle/?snr=1_7_7_2300_150_1',
          id: '1314764',
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
});
