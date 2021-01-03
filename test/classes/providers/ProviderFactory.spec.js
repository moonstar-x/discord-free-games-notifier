const ProviderFactory = require('../../../src/classes/providers/ProviderFactory');
const SteamProvider = require('../../../src/classes/providers/SteamProvider');
const EpicGamesProvider = require('../../../src/classes/providers/EpicGamesProvider');
const AbstractProvider = require('../../../src/classes/providers/AbstractProvider');

describe('Classes - Providers - ProviderFactory', () => {
  describe('static getAll()', () => {
    it('should return an Array.', () => {
      expect(ProviderFactory.getAll()).toBeInstanceOf(Array);
    });

    it('should return an array of provider objects.', () => {
      ProviderFactory.getAll().forEach((provider) => {
        expect(provider).toBeInstanceOf(AbstractProvider);
      });
    });
  });

  describe('static getInstance()', () => {
    it('should return a SteamProvider if name is steam.', () => {
      expect(ProviderFactory.getInstance('steam')).toBeInstanceOf(SteamProvider);
    });

    it('should return an EpicGamesProvider if name is epic.', () => {
      expect(ProviderFactory.getInstance('epic')).toBeInstanceOf(EpicGamesProvider);
    });

    it('should return an EpicGamesProvider if name is epicgames.', () => {
      expect(ProviderFactory.getInstance('epicgames')).toBeInstanceOf(EpicGamesProvider);
    });

    it('should throw if name is not valid.', () => {
      expect(() => {
        ProviderFactory.getInstance('any');
      }).toThrow(TypeError);
    });
  });
});
