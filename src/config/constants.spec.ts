import * as constants from './constants';

describe('Config > Constants', () => {
  it('should export correct MESSAGE_EMBED_COLOR.', () => {
    expect(constants.MESSAGE_EMBED_COLOR).toBe('#43aa8b');
  });

  it('should export correct MESSAGE_EMBED_THUMBNAIL.', () => {
    expect(constants.MESSAGE_EMBED_THUMBNAIL).toBe('https://i.imgur.com/Tqnk48j.png');
  });

  it('should export correct BOT_ISSUES_URL.', () => {
    expect(constants.BOT_ISSUES_URL).toBe('https://github.com/moonstar-x/discord-free-games-notifier/issues');
  });

  it('should export correct CRAWLER_ISSUES_URL.', () => {
    expect(constants.CRAWLER_ISSUES_URL).toBe('https://github.com/moonstar-x/free-games-crawler/issues');
  });

  it('should export correct BOT_WEBSITE_URL.', () => {
    expect(constants.BOT_WEBSITE_URL).toBe('https://docs.moonstar-x.dev/discord-free-games-notifier');
  });
});
