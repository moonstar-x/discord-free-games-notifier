const axios = require('axios');
const logger = require('@greencoast/logger');
const AbstractProvider = require('./AbstractProvider');
const Cache = require('../Cache');

class EpicGamesProvider extends AbstractProvider {
  constructor() {
    super();

    this.name = 'Epic Games';
    this.cache = new Cache(this.name);
  }

  getData() {
    return axios.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions')
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw error;
      });
  }

  getOffers() {
    if (this.cache.shouldFetchFromCache()) {
      return Promise.resolve(this.cache.get());
    }

    return this.getData()
      .then((data) => {
        const games = data.data.Catalog.searchStore.elements;
        const offers = games.reduce((offers, game) => {
          if (game.promotions && game.promotions.promotionalOffers && game.promotions.promotionalOffers.length > 0) {
            offers.push(AbstractProvider.createOffer(this.name, game.title, `https://epicgames.com/store/product/${game.productSlug}/home`, game.productSlug));
          }
          return offers;
        }, []);

        this.cache.set(offers);
        return offers;
      })
      .catch((error) => {
        logger.error(`Could not fetch offers from ${this.name}!`);
        logger.error(error);
        return null;
      });
  }
}

module.exports = EpicGamesProvider;
