const { parseChannelMention } = require('../../src/common/utils');
const { channelMock, channelStoreMock } = require('../../__mocks__/discordMocks');

describe('Common - Utils', () => {
  describe('parseChannelMention()', () => {
    it('should return a channel if the id corresponds.', () => {
      expect(parseChannelMention(channelStoreMock, `<#${channelMock.id}>`)).toBe(channelMock);
    });

    it('should return undefined if nothing is found.', () => {
      expect(parseChannelMention(channelStoreMock, 'whatever')).toBeUndefined();
    });
  });
});
