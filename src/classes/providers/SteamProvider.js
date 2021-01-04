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
    return axios.get('https://steamdb.info/sales/', { headers: { 'user-agent': UA } })
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

        const games = $('span').filter((_, node) => {
          return node.attribs.class && node.attribs.class.includes('sales-free-to-keep');
        }).map((_, node) => node.parent.parent);

        const offers = [];
        games.each((_, node) => {
          const a = node.children[1];
          offers.push(AbstractProvider.createOffer(this.name, a.children[0].data, `https://store.steampowered.com${a.attribs.href}`, a.attribs.href));
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
