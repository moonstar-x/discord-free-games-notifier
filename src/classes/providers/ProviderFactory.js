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
      case 'epic':
      case 'epicgames':
        return epicGamesProvider;

      case 'steam':
        return steamProvider;

      default:
        throw new TypeError(`No provider exists for ${name}!`);
    }
  }
}

module.exports = ProviderFactory;
