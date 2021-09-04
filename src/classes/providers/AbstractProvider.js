/* eslint-disable max-params */
class AbstractProvider {
  constructor() {
    if (new.target === AbstractProvider) {
      throw new TypeError('Cannot instantiate AbstractProvider!');
    }
  }

  /**
   * Return a Promise that resolves to the data received by the corresponding service.
   * @returns {Promise<string|object>}
   */
  getData() {
    throw new Error('Method not implemented!');
  }

  /**
   * Returns a Promise that resolves to an array of currently available offers.
   * @returns {Promise<GameOffer[]>}
   */
  getOffers() {
    throw new Error('Method not implemented!');
  }

  /**
   * Returns an object with the correct shape corresponding to a GameOffer.
   * @param {...Arguments} _ The GameOffer properties.
   * @returns {GameOffer}
   */
  static createOffer(provider, game, url, id) {
    return {
      provider,
      game,
      url,
      id,
      lastFetched: Date.now()
    };
  }
}

module.exports = AbstractProvider;
