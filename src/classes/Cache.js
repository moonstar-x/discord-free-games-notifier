const logger = require('@greencoast/logger');
const { DEBUG_ENABLED } = require('../common/context');

class Cache {
  constructor(name) {
    this.name = name;
    this.content = null;
    this.lastWriteTimestamp = null;
  }

  shouldFetchFromCache() {
    if (!this.lastWriteTimestamp) {
      return false;
    }

    return Date.now() < this.lastWriteTimestamp + Cache.MAX_AGE;
  }

  get() {
    if (DEBUG_ENABLED) {
      logger.debug(`(CACHE): Read data for ${this.name} from cache.`);
    }

    return this.content;
  }

  set(content) {
    if (DEBUG_ENABLED) {
      logger.debug(`(CACHE): Wrote data for ${this.name} to cache.`);
    }

    this.content = content;
    this.lastWriteTimestamp = Date.now();
  }
}

Cache.MAX_AGE = 900000; // 15 Minutes

module.exports = Cache;
