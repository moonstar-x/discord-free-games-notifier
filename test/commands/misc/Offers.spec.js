const logger = require('@greencoast/logger');
const OffersCommand = require('../../../src/commands/misc/Offers');
const ExtendedCommand = require('../../../src/classes/extensions/ExtendedCommand');
const ProviderFactory = require('../../../src/classes/providers/ProviderFactory');
const { clientMock, messageMock } = require('../../../__mocks__/discordMocks');
const { offerMock, providerMock } = require('../../../__mocks__/providers');

jest.mock('@greencoast/logger');
jest.mock('../../../src/classes/providers/ProviderFactory');

let command;

describe('Commands - Offers', () => {
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
    messageMock.say.mockClear();

    command = new OffersCommand(clientMock);
  });

  it('should be instance of ExtendedCommand.', () => {
    expect(command).toBeInstanceOf(ExtendedCommand);
  });

  it('should call logger.info with the proper message.', () => {
    jest.spyOn(command, 'handleAllProviders').mockReturnValue(null);
    command.run(messageMock, []);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
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
    it('should return a string.', () => {
      expect(typeof command.prepareMessageForOffer('header', [offerMock])).toBe('string');
    });

    it('should return a string with the proper structure.', () => {
      expect(command.prepareMessageForOffer('header', [offerMock])).toBe(`header\n\n1. ${offerMock.game} - available at: ${offerMock.url}\n`);
    });
  });

  describe('handleAllProviders()', () => {
    beforeEach(() => {
      providerMock.getOffers.mockReturnValue(Promise.resolve([offerMock]));
    });

    it('should return an array of promises.', () => {
      const result = command.handleAllProviders(messageMock);
      expect(result).toBeInstanceOf(Array);
      result.forEach((res) => {
        expect(res).toBeInstanceOf(Promise);
      });
    });

    it('should send a message if something happened when fetching the offers.', () => {
      providerMock.getOffers.mockReturnValue(Promise.resolve(null));

      return Promise.all(command.handleAllProviders(messageMock))
        .then(() => {
          expect(messageMock.say).toHaveBeenCalledTimes(2);
          expect(messageMock.say).toHaveBeenCalledWith(`Something happened when looking for offers in ${providerMock.name}. Try again later.`);
        });
    });

    it('should not do anything if no offers are available.', () => {
      providerMock.getOffers.mockReturnValue(Promise.resolve([]));

      return Promise.all(command.handleAllProviders(messageMock))
        .then(() => {
          expect(messageMock.say).not.toHaveBeenCalled();
        });
    });

    it('should send a message with the offer string.', () => {
      jest.spyOn(command, 'prepareMessageForOffer').mockReturnValue('message');

      return Promise.all(command.handleAllProviders(messageMock))
        .then(() => {
          expect(messageMock.say).toHaveBeenCalledTimes(2);
          expect(messageMock.say).toHaveBeenCalledWith('message');
        });
    });
  });

  describe('handleSingleProvider()', () => {
    it('should return a Promise.', () => {
      expect(command.handleSingleProvider(messageMock, 'valid')).toBeInstanceOf(Promise);
    });

    it('should send a message if the providerName is not valid.', () => {
      command.handleSingleProvider(messageMock, 'invalid');

      expect(messageMock.say).toHaveBeenCalledTimes(1);
    });

    it('should throw if something else happened.', () => {
      ProviderFactory.getInstance.mockImplementationOnce(() => {
        throw new Error();
      });

      expect(() => {
        command.handleSingleProvider(messageMock, 'valid');
      }).toThrow();
    });

    it('should send a message if something happened when fetching the offers.', () => {
      providerMock.getOffers.mockResolvedValueOnce(null);

      return command.handleSingleProvider(messageMock, 'valid')
        .then(() => {
          expect(messageMock.say).toHaveBeenCalledTimes(1);
          expect(messageMock.say).toHaveBeenCalledWith(`Something happened when looking for offers in ${providerMock.name}. Try again later.`);
        });
    });

    it('should send a message if no offers are currently available.', () => {
      providerMock.getOffers.mockResolvedValueOnce([]);

      return command.handleSingleProvider(messageMock, 'valid')
        .then(() => {
          expect(messageMock.say).toHaveBeenCalledTimes(1);
          expect(messageMock.say).toHaveBeenCalledWith(`There are no free games currently in ${providerMock.name}. :(`);
        });
    });

    it('should send a message with the offer string.', () => {
      jest.spyOn(command, 'prepareMessageForOffer').mockReturnValue('message');

      return command.handleSingleProvider(messageMock, 'valid')
        .then(() => {
          expect(messageMock.say).toHaveBeenCalledTimes(1);
          expect(messageMock.say).toHaveBeenCalledWith('message');
        });
    });
  });
});
