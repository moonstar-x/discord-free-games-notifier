const EpicGamesProvider = require('./EpicGamesProvider');
const SteamProvider = require('./SteamProvider');
const UbisoftProvider = require('./UbisoftProvider');

const epicGamesProvider = new EpicGamesProvider();
const steamProvider = new SteamProvider();
const ubisoftProvider = new UbisoftProvider();

class ProviderFactory {
  static getAll() {
    return [
      epicGamesProvider,
      steamProvider,
      ubisoftProvider
    ];
  }

  static getInstance(name) {
    switch (name) {
      case ProviderFactory.providerNames.epic:
        return epicGamesProvider;

      case ProviderFactory.providerNames.steam:
        return steamProvider;

      case ProviderFactory.providerNames.steam:
        return ubisoftProvider;

      default:
        throw new TypeError(`No provider exists for ${name}!`);
    }
  }
}

ProviderFactory.providerNames = {
  steam: 'steam',
  epic: 'epic',
  ubisoft: 'ubisoft'
};

module.exports = ProviderFactory;
