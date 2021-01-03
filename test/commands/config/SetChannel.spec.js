const logger = require('@greencoast/logger');
const SetChannelCommand = require('../../../src/commands/config/SetChannel');
const ExtendedCommand = require('../../../src/classes/extensions/ExtendedCommand');
const { GUILD_KEYS } = require('../../../src/db');
const { clientMock, messageMock, channelMock } = require('../../../__mocks__/discordMocks');

jest.mock('@greencoast/logger');

let command;

describe('Commands - SetChannel', () => {
  beforeEach(() => {
    logger.info.mockClear();
    logger.error.mockClear();
    messageMock.say.mockClear();
    messageMock.reply.mockClear();
    clientMock.provider.get.mockClear();
    clientMock.provider.set.mockClear();

    command = new SetChannelCommand(clientMock);
  });

  it('should be instance of ExtendedCommand.', () => {
    expect(command).toBeInstanceOf(ExtendedCommand);
  });

  it('should call logger.info with the proper message.', () => {
    command.run(messageMock, []);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
  });

  describe('run()', () => {
    it('should reply that a mention is required if no mention is passed.', () => {
      command.run(messageMock, []);

      expect(messageMock.reply).toHaveBeenCalledTimes(1);
      expect(messageMock.reply).toHaveBeenCalledWith('you need to mention the channel you wish to set.');
    });

    it('should reply that the channel was not found if the mention is not valid.', () => {
      command.run(messageMock, ['whatever']);

      expect(messageMock.reply).toHaveBeenCalledTimes(1);
      expect(messageMock.reply).toHaveBeenCalledWith("I couldn't find the channel you mentioned, are you sure it exists?");
    });

    it('should reply if the channel is not viewable.', () => {
      channelMock.viewable = false;
      command.run(messageMock, [channelMock.id]);

      expect(messageMock.reply).toHaveBeenCalledTimes(1);
      expect(messageMock.reply).toHaveBeenCalledWith('I cannot see the channel you mentioned, do I have enough permissions to access it?');
      
      channelMock.viewable = true;
    });

    it('should call updateChannel if all is well.', () => {
      const updateSpy = jest.spyOn(command, 'updateChannel').mockReturnValue(null);

      command.run(messageMock, [channelMock.id]);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(messageMock, channelMock);
    });
  });

  describe('updateChannel()', () => {
    beforeAll(() => {
      clientMock.provider.get.mockReturnValue('old id');
      clientMock.provider.set.mockImplementation(() => Promise.resolve());
    });

    it('should reply if the channel previously set is the same as the new one.', () => {
      clientMock.provider.get.mockReturnValueOnce(channelMock.id);

      command.updateChannel(messageMock, channelMock);

      expect(messageMock.reply).toHaveBeenCalledTimes(1);
      expect(messageMock.reply).toHaveBeenCalledWith('the channel you mentioned is already set as the announcement channel.');
    });

    it('should return a Promise.', () => {
      expect(command.updateChannel(messageMock, channelMock)).toBeInstanceOf(Promise);
    });

    it('should call client.provider.set with the correct arguments.', () => {
      return command.updateChannel(messageMock, channelMock)
        .then(() => {
          expect(clientMock.provider.set).toHaveBeenCalledTimes(1);
          expect(clientMock.provider.set).toHaveBeenCalledWith(messageMock.guild, GUILD_KEYS.channel, channelMock.id);
        });
    });

    it('should log and reply if the channel has been updated.', () => {
      return command.updateChannel(messageMock, channelMock)
        .then(() => {
          expect(logger.info).toHaveBeenCalledTimes(1);
          expect(logger.info).toHaveBeenCalledWith(`Announcement channel changed for ${messageMock.guild.name} to #${channelMock.name}.`);
          expect(messageMock.say).toHaveBeenCalledTimes(1);
          expect(messageMock.say).toHaveBeenCalledWith(`The announcement channel has been changed to **#${channelMock.name}**.`);
        });
    });

    it('should log and reply if there was an error when setting the channel.', () => {
      const expectedError = new Error('Oops');
      clientMock.provider.set.mockRejectedValueOnce(expectedError);
      
      return command.updateChannel(messageMock, channelMock)
        .then(() => {
          expect(logger.error).toHaveBeenCalledTimes(1);
          expect(logger.error).toHaveBeenCalledWith(expectedError);
          expect(messageMock.say).toHaveBeenCalledTimes(1);
          expect(messageMock.say).toHaveBeenCalledWith('Something happened when trying to update the announcement channel.');
        });
    });
  });
});
