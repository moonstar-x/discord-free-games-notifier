const EpicGamesProvider = require('./EpicGamesProvider');
const SteamProvider = require('./SteamProvider');

const epicGamesProvider = new EpicGamesProvider();
const steamProvider = new SteamProvider();

class ProviderFactory {
  static getAll() {
    return [
      epicGamesProvider,
      steamProvider
    ];
  }

  static getInstance(name) {
    switch (name) {
      case ProviderFactory.providerNames.epic:
        return epicGamesProvider;

      case ProviderFactory.providerNames.steam:
        return steamProvider;

      default:
        throw new TypeError(`No provider exists for ${name}!`);
    }
  }
}

ProviderFactory.providerNames = {
  steam: 'steam',
  epic: 'epic'
};

module.exports = ProviderFactory;
