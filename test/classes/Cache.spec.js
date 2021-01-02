const Cache = require('../../src/classes/Cache');

let cache;

const nowSpy = jest.spyOn(Date, 'now');
const mockedTimestamp = 1609573038753;
nowSpy.mockReturnValue(mockedTimestamp);

describe('Classes - Cache', () => {
  beforeEach(() => {
    cache = new Cache();
  });

  it('should have a content property.', () => {
    expect(cache).toHaveProperty('content');
  });

  it('should have a lastWriteTimestamp property.', () => {
    expect(cache).toHaveProperty('lastWriteTimestamp');
  });

  describe('get()', () => {
    it('should return content.', () => {
      cache.content = 'new content';
      expect(cache.get()).toBe(cache.content);
    });
  });

  describe('set()', () => {
    it('should set content.', () => {
      cache.set('new content');
      expect(cache.content).toBe('new content');
    });

    it('should update the lastWriteTimestamp property.', () => {
      cache.set('new content');
      expect(cache.lastWriteTimestamp).toBe(mockedTimestamp);
    });
  });

  describe('shouldFetchFromCache()', () => {
    it('should return false if lastWriteTimestamp is null.', () => {
      expect(cache.shouldFetchFromCache()).toBe(false);
    });

    it('should return false if content is old.', () => {
      cache.set('old content');
      nowSpy.mockReturnValueOnce(mockedTimestamp + Cache.MAX_AGE + 5000);

      expect(cache.shouldFetchFromCache()).toBe(false);
    });

    it('should return true if content is still valid.', () => {
      cache.set('old content');
      nowSpy.mockReturnValueOnce(mockedTimestamp + Cache.MAX_AGE - 5000);

      expect(cache.shouldFetchFromCache()).toBe(true);
    });
  });

  describe('static MAX_AGE', () => {
    it('should be a number.', () => {
      expect(Cache.MAX_AGE).not.toBeNaN();
    });
  });
});
