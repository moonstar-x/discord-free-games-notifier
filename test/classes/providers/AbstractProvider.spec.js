/* eslint-disable no-new */
const AbstractProvider = require('../../../src/classes/providers/AbstractProvider');

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
        id: 'id'
      };

      expect(AbstractProvider.createOffer('provider', 'game', 'url', 'id')).toStrictEqual(expected);
    });
  });
});
