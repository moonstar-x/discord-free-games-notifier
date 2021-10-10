const cheerio = require('cheerio');
const logger = require('@greencoast/logger');
const AbstractProvider = require('./AbstractProvider');
const Cache = require('../Cache');
const puppeteer = require('puppeteer')

class UbisoftProvider extends AbstractProvider {
  constructor() {
    super();

    this.name = 'Ubisoft';
    this.cache = new Cache(this.name);
  }

  getData() {
    return axios.get('https://free.ubisoft.com', { headers: { 'user-agent': UA } })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw error;
      });
  }

  async getOffers() {
    if (this.cache.shouldFetchFromCache()) {
      return Promise.resolve(this.cache.get());
    }

 const browser = await puppeteer.launch({ headless: true })
 const page = await browser.newPage()
 await page.goto('https://free.ubisoft.com')

 await page.waitForSelector(".ubilogo")
    return await page.evaluate(() => document.body.innerHTML).then((html) => {
        const $ = cheerio.load(html);
        const games = $('.free-events').children();
        const offers = [];

        games.each((_, node) => {
          const name = node.childNodes[2].childNodes[0].attribs['data-name'];
          const url = 'https://free.ubisoft.com';
          const id = '1';

          offers.push(AbstractProvider.createOffer(this.name, name, url, id));
        });

        this.cache.set(offers);
        return offers;
      }).catch((error) => {
        logger.error(`Could not fetch offers from ${this.name}!`);
        logger.error(error);
        return null;
      });
  }
}

module.exports = UbisoftProvider;
