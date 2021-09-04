const DisableCommand = require('../../../src/commands/config/DisableCommand');
const logger = require('@greencoast/logger');
const { clientMock, messageMock } = require('../../../__mocks__/discordMocks');

jest.mock('@greencoast/logger');

describe('Commands - DisableCommand', () => {
  let command;

  beforeEach(() => {
    command = new DisableCommand(clientMock);

    logger.info.mockClear();
    messageMock.channel.send.mockClear();
    messageMock.reply.mockClear();
    clientMock.dataProvider.get.mockClear();
    clientMock.dataProvider.set.mockClear();
  });

  describe('run()', () => {
    it('should reply if no channel is saved in the database.', () => {
      clientMock.dataProvider.get.mockResolvedValueOnce(null);

      return command.run(messageMock)
        .then(() => {
          expect(messageMock.reply).toHaveBeenCalledTimes(1);
          expect(messageMock.reply.mock.calls[0][0]).toContain('no announcement');
        });
    });

    it('should set the channel to null for the guild.', () => {
      clientMock.dataProvider.get.mockResolvedValueOnce('channel');

      return command.run(messageMock)
        .then(() => {
          expect(clientMock.dataProvider.set).toHaveBeenCalledWith(messageMock.guild, 'channel', null);
        });
    });

    it('should log that the channel has been removed for the guild.', () => {
      clientMock.dataProvider.get.mockResolvedValueOnce('channel');

      return command.run(messageMock)
        .then(() => {
          expect(logger.info).toHaveBeenCalledTimes(1);
          expect(logger.info.mock.calls[0][0]).toContain('disabled');
        });
    });

    it('should send a message that the channel has been removed for the guild.', () => {
      clientMock.dataProvider.get.mockResolvedValueOnce('channel');

      return command.run(messageMock)
        .then(() => {
          expect(messageMock.channel.send).toHaveBeenCalledTimes(1);
          expect(messageMock.channel.send.mock.calls[0][0]).toContain('disabled');
        });
    });
  });
});
