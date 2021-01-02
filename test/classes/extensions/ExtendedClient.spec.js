const { CommandoClient } = require('discord.js-commando');
const logger = require('@greencoast/logger');
const ExtendedClient = require('../../../src/classes/extensions/ExtendedClient');
const { guildMock } = require('../../../__mocks__/discordMocks');

jest.mock('@greencoast/logger');
jest.mock('discord.js-commando', () => ({
  CommandoClient: jest.fn()
}));

const client = new ExtendedClient();
client.user = {
  setPresence: jest.fn(() => Promise.resolve())
};
client.guilds = {
  cache: {
    array: jest.fn(() => [guildMock, guildMock, guildMock]),
    reduce: jest.fn((cb, init) => client.guilds.cache.array().reduce(cb, init))
  }
};

describe('Classes - Extensions - ExtendedClient', () => {
  beforeEach(() => {
    logger.error.mockClear();
    logger.info.mockClear();
  });

  it('should be an instance of CommandoClient.', () => {
    expect(client).toBeInstanceOf(CommandoClient);
  });

  describe('handleCommandError()', () => {
    it('should log the error and info.', () => {
      const expectedError = new Error();
      const expectedInfo = 'Information...';
      client.handleCommandError(expectedError, expectedInfo);
      
      expect(logger.error).toBeCalledTimes(2);
      expect(logger.error).toHaveBeenCalledWith(expectedError);
      expect(logger.error).toHaveBeenCalledWith(expectedInfo);
    });
  });

  describe('updatePresence()', () => {
    it('should return a Promise.', () => {
      expect(client.updatePresence()).toBeInstanceOf(Promise);
    });

    it('should log successful presence update.', () => {
      return client.updatePresence('hi')
        .then(() => {
          expect(logger.info).toHaveBeenCalledTimes(1);
          expect(logger.info).toHaveBeenCalledWith('Presence updated to: 3 servers!');
        });
    });

    it('should log error if presence could not update.', () => {
      const expectedError = new Error();
      client.user.setPresence.mockRejectedValueOnce(expectedError);

      return client.updatePresence('hi')
        .then(() => {
          expect(logger.error).toHaveBeenCalledTimes(1);
          expect(logger.error).toHaveBeenCalledWith(expectedError);
        });
    });
  });
});
