const logger = require('@greencoast/logger');
const { DEV_MODE } = require('../common/context');

class OffersCache {
  constructor(dataProvider) {
    this.dataProvider = dataProvider;
  }

  async isOfferCached(offer) {
    const cachedOffers = await this.dataProvider.getGlobal('notified', []);

    return cachedOffers.some((o) => o.id === offer.id);
  }

  async update(currentOffers) {
    const cachedOffers = await this.dataProvider.getGlobal('notified', []);

    const merged = this.mergeOffers(currentOffers, cachedOffers);

    if (DEV_MODE) {
      logger.debug('Offers in cache:', merged);
    }

    await this.dataProvider.setGlobal('notified', merged);
  }

  mergeOffers(currentOffers, cachedOffers) {
    const merged = [];
    const maxAge = DEV_MODE ? OffersCache.DEV_MAX_AGE : OffersCache.MAX_AGE;

    for (const offer of cachedOffers) {
      if (Date.now() < offer.lastFetched + maxAge) {
        merged.push(offer);
      }
    }

    for (const offer of currentOffers) {
      const offerInMergedIndex = merged.findIndex((o) => o.id === offer.id);

      if (offerInMergedIndex > -1) {
        merged[offerInMergedIndex] = offer;
      } else {
        merged.push(offer);
      }
    }

    return merged;
  }
}

OffersCache.MAX_AGE = 24 * 60 * 60 * 1000; // 1 Day
OffersCache.DEV_MAX_AGE = 90000; // 1.5 Minutes

module.exports = OffersCache;
