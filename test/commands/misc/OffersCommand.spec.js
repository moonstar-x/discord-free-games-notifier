const logger = require('@greencoast/logger');
const OffersCommand = require('../../../src/commands/misc/OffersCommand');
const ProviderFactory = require('../../../src/classes/providers/ProviderFactory');
const { clientMock, messageMock } = require('../../../__mocks__/discordMocks');
const { offerMock, providerMock } = require('../../../__mocks__/providers');

jest.mock('@greencoast/logger');
jest.mock('../../../src/classes/providers/ProviderFactory');

let command;

describe('Commands - OffersCommand', () => {
  beforeAll(() => {
    ProviderFactory.getAll.mockReturnValue([providerMock, providerMock]);
    ProviderFactory.getInstance.mockImplementation((name) => {
      if (name === 'valid') {
        return providerMock;
      }
      throw new TypeError('Invalid provider');
    });
  });

  beforeEach(() => {
    logger.info.mockClear();
    messageMock.channel.send.mockClear();

    command = new OffersCommand(clientMock);
  });

  describe('run()', () => {
    it('should call handleAllProviders if no argument is passed.', () => {
      const handleSpy = jest.spyOn(command, 'handleAllProviders').mockReturnValue(null);

      command.run(messageMock, []);

      expect(handleSpy).toHaveBeenCalledTimes(1);
      expect(handleSpy).toHaveBeenCalledWith(messageMock);
    });

    it('should call handleAllProviders if no argument is passed.', () => {
      const handleSpy = jest.spyOn(command, 'handleSingleProvider').mockReturnValue(null);

      command.run(messageMock, ['name']);

      expect(handleSpy).toHaveBeenCalledTimes(1);
      expect(handleSpy).toHaveBeenCalledWith(messageMock, 'name');
    });
  });

  describe('prepareMessageForOffer()', () => {
    it('should return a string with the proper structure.', () => {
      expect(command.prepareMessageForOffer('header', [offerMock])).toBe(`header\n\n1. ${offerMock.game} - available at: ${offerMock.url}\n`);
    });
  });

  describe('handleAllProviders()', () => {
    beforeEach(() => {
      providerMock.getOffers.mockResolvedValue([offerMock]);
    });

    it('should send a message if something happened when fetching the offers.', () => {
      providerMock.getOffers.mockResolvedValue(null);

      return command.handleAllProviders(messageMock)
        .then(() => {
          expect(messageMock.channel.send).toHaveBeenCalledTimes(2);
          expect(messageMock.channel.send.mock.calls[0][0]).toContain('Something happened');
        });
    });

    it('should not do anything if no offers are available.', () => {
      providerMock.getOffers.mockResolvedValue([]);

      return command.handleAllProviders(messageMock)
        .then(() => {
          expect(messageMock.channel.send).not.toHaveBeenCalled();
        });
    });

    it('should send a message with the offer string.', () => {
      jest.spyOn(command, 'prepareMessageForOffer').mockReturnValue('message');

      return command.handleAllProviders(messageMock)
        .then(() => {
          expect(messageMock.channel.send).toHaveBeenCalledTimes(2);
          expect(messageMock.channel.send).toHaveBeenCalledWith('message');
        });
    });
  });

  describe('handleSingleProvider()', () => {
    it('should send a message if the providerName is not valid.', () => {
      return command.handleSingleProvider(messageMock, 'invalid')
        .then(() => {
          expect(messageMock.channel.send).toHaveBeenCalledTimes(1);
        });
    });

    it('should reject if something else happened.', () => {
      const expectedError = new Error('Oops');
      ProviderFactory.getInstance.mockImplementationOnce(() => {
        throw expectedError;
      });

      expect.assertions(1);

      return command.handleSingleProvider(messageMock, 'valid')
        .catch((error) => {
          expect(error).toBe(expectedError);
        });
    });

    it('should send a message if something happened when fetching the offers.', () => {
      providerMock.getOffers.mockResolvedValueOnce(null);

      return command.handleSingleProvider(messageMock, 'valid')
        .then(() => {
          expect(messageMock.channel.send).toHaveBeenCalledTimes(1);
          expect(messageMock.channel.send.mock.calls[0][0]).toContain('Something happened');
        });
    });

    it('should send a message if no offers are currently available.', () => {
      providerMock.getOffers.mockResolvedValueOnce([]);

      return command.handleSingleProvider(messageMock, 'valid')
        .then(() => {
          expect(messageMock.channel.send).toHaveBeenCalledTimes(1);
          expect(messageMock.channel.send.mock.calls[0][0]).toContain('no free games');
        });
    });

    it('should send a message with the offer string.', () => {
      jest.spyOn(command, 'prepareMessageForOffer').mockReturnValue('message');

      return command.handleSingleProvider(messageMock, 'valid')
        .then(() => {
          expect(messageMock.channel.send).toHaveBeenCalledTimes(1);
          expect(messageMock.channel.send).toHaveBeenCalledWith('message');
        });
    });
  });
});
