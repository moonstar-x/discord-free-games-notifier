class Cache {
  constructor() {
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
    return this.content;
  }

  set(content) {
    this.content = content;
    this.lastWriteTimestamp = Date.now();
  }
}

Cache.MAX_AGE = 900000; // 15 Minutes

module.exports = Cache;
