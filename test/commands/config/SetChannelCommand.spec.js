/* eslint-disable max-len */
const logger = require('@greencoast/logger');
const SetChannelCommand = require('../../../src/commands/config/SetChannelCommand');
const { GUILD_KEYS } = require('../../../src/common/constants');
const { clientMock, messageMock, channelMock } = require('../../../__mocks__/discordMocks');

jest.mock('@greencoast/logger');

let command;

describe('Commands - SetChannelCommand', () => {
  beforeEach(() => {
    logger.info.mockClear();
    logger.error.mockClear();
    messageMock.channel.send.mockClear();
    messageMock.reply.mockClear();
    clientMock.dataProvider.get.mockClear();
    clientMock.dataProvider.set.mockClear();

    command = new SetChannelCommand(clientMock);
  });

  describe('run()', () => {
    it('should reply that a mention is required if no mention is passed.', () => {
      messageMock.mentions.channels.first.mockReturnValueOnce(null);
      command.run(messageMock);

      expect(messageMock.reply).toHaveBeenCalledTimes(1);
      expect(messageMock.reply.mock.calls[0][0]).toContain('you need to mention the channel');
    });

    it('should reply if the channel is not viewable.', () => {
      channelMock.viewable = false;
      command.run(messageMock);

      expect(messageMock.reply).toHaveBeenCalledTimes(1);
      expect(messageMock.reply.mock.calls[0][0]).toContain('I cannot see the channel');
      
      channelMock.viewable = true;
    });
  });

  describe('updateChannel()', () => {
    beforeAll(() => {
      clientMock.dataProvider.get.mockResolvedValue('old id');
      clientMock.dataProvider.set.mockResolvedValue();
    });

    it('should reply if the channel previously set is the same as the new one.', () => {
      clientMock.dataProvider.get.mockResolvedValueOnce(channelMock.id);

      return command.updateChannel(messageMock, channelMock)
        .then(() => {
          expect(messageMock.reply).toHaveBeenCalledTimes(1);
          expect(messageMock.reply.mock.calls[0][0]).toContain('is already set');
        });
    });

    it('should call client.dataProvider.set with the correct arguments.', () => {
      return command.updateChannel(messageMock, channelMock)
        .then(() => {
          expect(clientMock.dataProvider.set).toHaveBeenCalledTimes(1);
          expect(clientMock.dataProvider.set).toHaveBeenCalledWith(messageMock.guild, GUILD_KEYS.channel, channelMock.id);
        });
    });

    it('should log and reply if the channel has been updated.', () => {
      return command.updateChannel(messageMock, channelMock)
        .then(() => {
          expect(logger.info).toHaveBeenCalledTimes(1);
          expect(logger.info.mock.calls[0][0]).toContain('channel changed');
          expect(messageMock.channel.send).toHaveBeenCalledTimes(1);
          expect(messageMock.channel.send.mock.calls[0][0]).toContain('channel has been change');
        });
    });

    it('should log and reply if there was an error when setting the channel.', () => {
      const expectedError = new Error('Oops');
      clientMock.dataProvider.set.mockRejectedValueOnce(expectedError);
      
      return command.updateChannel(messageMock, channelMock)
        .then(() => {
          expect(logger.error).toHaveBeenCalledTimes(1);
          expect(logger.error).toHaveBeenCalledWith(expectedError);
          expect(messageMock.channel.send).toHaveBeenCalledTimes(1);
          expect(messageMock.channel.send.mock.calls[0][0]).toContain('Something happened');
        });
    });
  });
});
