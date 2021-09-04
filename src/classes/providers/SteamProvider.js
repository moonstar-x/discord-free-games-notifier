const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('@greencoast/logger');
const AbstractProvider = require('./AbstractProvider');
const Cache = require('../Cache');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';

class SteamProvider extends AbstractProvider {
  constructor() {
    super();

    this.name = 'Steam';
    this.cache = new Cache(this.name);
  }

  getData() {
    return axios.get('https://store.steampowered.com/search/?maxprice=free&specials=1', { headers: { 'user-agent': UA } })
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
      .then((html) => {
        const $ = cheerio.load(html);
        const games = $('#search_resultsRows').children();

        const offers = [];
        games.each((_, node) => {
          const name = node.children[3].children[1].children[1].children[0].data;
          const url = node.attribs.href;
          const id = node.attribs['data-ds-appid'];

          offers.push(AbstractProvider.createOffer(this.name, name, url, id));
        });

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

module.exports = SteamProvider;
