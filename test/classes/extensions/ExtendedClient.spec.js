const { CommandoClient } = require('discord.js-commando');
const logger = require('@greencoast/logger');
const cron = require('cron');
const ExtendedClient = require('../../../src/classes/extensions/ExtendedClient');
const ProviderFactory = require('../../../src/classes/providers/ProviderFactory');
const { guildMock, channelMock } = require('../../../__mocks__/discordMocks');
const { offerMock, providerMock } = require('../../../__mocks__/providers');

jest.mock('@greencoast/logger');
jest.mock('cron');
jest.mock('discord.js-commando', () => ({
  CommandoClient: jest.fn()
}));
jest.mock('../../../src/classes/providers/ProviderFactory');

const client = new ExtendedClient();
client.user = {
  setPresence: jest.fn(() => Promise.resolve())
};
client.guilds = {
  cache: [guildMock, guildMock, guildMock]
};
client.provider = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn()
};

describe('Classes - Extensions - ExtendedClient', () => {
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
    logger.error.mockClear();
    logger.info.mockClear();
  });

  it('should be an instance of CommandoClient.', () => {
    expect(client).toBeInstanceOf(CommandoClient);
  });

  it('should have a notifyJob property.', () => {
    expect(client).toHaveProperty('notifyJob');
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

  describe('getChannelsForEnabledGuilds()', () => {
    it('should return an Array.', () => {
      expect(client.getChannelsForEnabledGuilds()).toBeInstanceOf(Array);
    });

    it('should return an Array of Channels.', () => {
      client.provider.get.mockReturnValue(true);
      const channels = client.getChannelsForEnabledGuilds();

      channels.forEach((channel) => {
        expect(channel.id).toBe(channelMock.id);
      });
    });
  });

  describe('initializeNotifyJob()', () => {
    let notifySpy;
    
    beforeAll(() => {
      notifySpy = jest.spyOn(client, 'notifyOffers')
        .mockReturnValue(Promise.resolve(true));
    });

    beforeEach(() => {
      notifySpy.mockClear();
      client.notifyJob = null;
    });

    it('should set the notifyJob property.', () => {
      client.initializeNotifyJob();
      
      expect(client.notifyJob).toBeInstanceOf(cron.CronJob);
    });

    it('should start the cronjob and log it.', () => {
      client.initializeNotifyJob();

      expect(client.notifyJob.start).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('(CRON): Notification job initialized.');
      expect(logger.info).toHaveBeenCalledWith('(CRON): Next execution is scheduled for: time');
    });

    it('should log when running the cronjob.', () => {
      client.initializeNotifyJob();

      return client.notifyJob.start()
        .then(() => {
          expect(logger.info).toHaveBeenCalled();
          expect(logger.info).toHaveBeenCalledWith('(CRON): Notifying enabled guilds...');
        });
    });

    it('should call notifyOffers when running the cronjob.', () => {
      client.initializeNotifyJob();

      return client.notifyJob.start()
        .then(() => {
          expect(notifySpy).toHaveBeenCalled();
        });
    });

    it('should log if notifications were sent on completion.', () => {
      client.initializeNotifyJob();

      return client.notifyJob.start()
        .then(() => {
          expect(logger.info).toHaveBeenCalled();
          expect(logger.info).toHaveBeenCalledWith('(CRON): Notification complete.');
          expect(logger.info).toHaveBeenCalledWith('(CRON): Next execution is scheduled for: time');
        });
    });

    it('should log if notification was skipped on completion.', () => {
      notifySpy.mockResolvedValue(false);
      client.initializeNotifyJob();

      return client.notifyJob.start()
        .then(() => {
          expect(logger.info).toHaveBeenCalled();
          expect(logger.info).toHaveBeenCalledWith('(CRON): Notification skipped, either there were no offers to notify or the offers have been already notified.');
          expect(logger.info).toHaveBeenCalledWith('(CRON): Next execution is scheduled for: time');
        });
    });

    afterAll(() => {
      notifySpy.mockRestore();
    });
  });

  describe('notifyOffers()', () => {
    let getChannelsSpy;

    beforeAll(() => {
      getChannelsSpy = jest.spyOn(client, 'getChannelsForEnabledGuilds')
        .mockReturnValue([channelMock]);
    });

    beforeEach(() => {
      channelMock.send.mockClear();
      providerMock.getOffers.mockResolvedValue([offerMock, offerMock]);
      client.provider.clear.mockClear();
      client.provider.set.mockClear();
    });

    it('should return a Promise.', () => {
      expect(client.notifyOffers()).toBeInstanceOf(Promise);
    });

    it('should resolve to false if the providers resolved to null.', () => {
      providerMock.getOffers.mockResolvedValue(null);

      return client.notifyOffers()
        .then((notified) => {
          expect(notified).toBe(false);
        });
    });

    it('should resolve to false if the providers resolved to an empty array.', () => {
      providerMock.getOffers.mockResolvedValue([]);

      return client.notifyOffers()
        .then((notified) => {
          expect(notified).toBe(false);
        });
    });

    it('should skip offers already notified.', () => {
      client.provider.get.mockReturnValue(true);

      return client.notifyOffers()
        .then(() => {
          expect(channelMock.send).not.toHaveBeenCalled();
        });
    });

    it('should send a notification per offer.', () => {
      client.provider.get.mockReturnValue(false);
      providerMock.getOffers.mockResolvedValue([offerMock, offerMock]);

      return client.notifyOffers()
        .then(() => {
          expect(channelMock.send).toHaveBeenCalled();
          expect(channelMock.send).toHaveBeenCalledWith(`${offerMock.game} is free to keep on ${offerMock.provider}, you can grab it from here: ${offerMock.url}`);
        });
    });

    it('should log an error if channel.send rejects.', () => {
      const expectedError = new Error('Oops');

      client.provider.get.mockReturnValue(false);
      providerMock.getOffers.mockResolvedValue([offerMock, offerMock]);
      channelMock.send.mockRejectedValue(expectedError);

      return client.notifyOffers()
        .then(() => {
          expect(logger.error).toHaveBeenCalled();
          expect(logger.error).toHaveBeenCalledWith(expectedError);
          expect(logger.error).toHaveBeenCalledWith(`Something happened when trying to notify ${channelMock.name} from ${channelMock.guild.name}, perhaps I don't have enough permissions to send the message?`);
        });
    });

    it('should update the offers saved in the db.', () => {
      client.provider.get.mockReturnValue(false);
      providerMock.getOffers.mockResolvedValue([offerMock, offerMock]);

      return client.notifyOffers()
        .then(() => {
          expect(client.provider.clear).toHaveBeenCalledTimes(1);
          expect(client.provider.clear).toHaveBeenCalledWith('global');

          expect(client.provider.set).toHaveBeenCalledTimes(4);
          expect(client.provider.set).toHaveBeenCalledWith('global', `notified-${offerMock.id}`, true);
        });
    });

    afterAll(() => {
      getChannelsSpy.mockRestore();
    });
  });
});
