/* eslint-disable no-new */
const AbstractProvider = require('../../../src/classes/providers/AbstractProvider');

jest.spyOn(Date, 'now').mockReturnValue(1000);

describe('Classes - Providers - AbstractProvider', () => {
  it('should throw if trying to instantiate.', () => {
    expect(() => {
      new AbstractProvider();
    }).toThrow(TypeError);
  });

  describe('static createOffer', () => {
    it('should return an object with the correct shape.', () => {
      const expected = {
        provider: 'provider',
        game: 'game',
        url: 'url',
        id: 'id',
        lastFetched: 1000
      };

      expect(AbstractProvider.createOffer('provider', 'game', 'url', 'id')).toStrictEqual(expected);
    });
  });
});
