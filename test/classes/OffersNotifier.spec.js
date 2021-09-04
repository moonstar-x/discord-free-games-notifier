const OffersNotifier = require('../../src/classes/OffersNotifier');
const cron = require('cron');
const logger = require('@greencoast/logger');
const ProviderFactory = require('../../src/classes/providers/ProviderFactory');
const { clientMock, channelMock } = require('../../__mocks__/discordMocks');
const { providerMock, offerMock } = require('../../__mocks__/providers');

jest.mock('cron');
jest.mock('@greencoast/logger');
jest.mock('../../src/classes/providers/ProviderFactory');

describe('Classes - OffersNotifier', () => {
  let notifier;

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
    notifier = new OffersNotifier(clientMock);

    logger.info.mockClear();

    channelMock.send.mockClear();
    clientMock.dataProvider.clearGlobal.mockClear();
    clientMock.dataProvider.setGlobal.mockClear();
    clientMock.dataProvider.getGlobal.mockClear();

    clientMock.dataProvider.getGlobal.mockResolvedValue([]);
  });

  describe('initialize()', () => {
    let notifySpy;

    beforeEach(() => {
      notifySpy = jest.spyOn(notifier, 'notify')
        .mockResolvedValue(true);
    });

    it('should set the notifyJob property.', () => {
      notifier.initialize();

      expect(notifier.notifyJob).toBeInstanceOf(cron.CronJob);
    });

    it('should start the cronjob and log it.', () => {
      notifier.initialize();

      expect(notifier.notifyJob.start).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('(CRON): Notification job initialized.');
      expect(logger.info).toHaveBeenCalledWith('(CRON): Next execution is scheduled for: time');
    });

    it('should log when running the cronjob.', () => {
      notifier.initialize();

      return notifier.notifyJob.start()
        .then(() => {
          expect(logger.info).toHaveBeenCalled();
          expect(logger.info).toHaveBeenCalledWith('(CRON): Notifying enabled guilds...');
        });
    });

    it('should call notify when running the cronjob.', () => {
      notifier.initialize();

      return notifier.notifyJob.start()
        .then(() => {
          expect(notifySpy).toHaveBeenCalled();
        });
    });

    it('should log if notifications were sent on completion.', () => {
      notifier.initialize();

      return notifier.notifyJob.start()
        .then(() => {
          expect(logger.info).toHaveBeenCalled();
          expect(logger.info).toHaveBeenCalledWith('(CRON): Notification complete.');
          expect(logger.info).toHaveBeenCalledWith('(CRON): Next execution is scheduled for: time');
        });
    });

    it('should log if notification was skipped on completion.', () => {
      notifySpy.mockResolvedValue(false);
      notifier.initialize();

      return notifier.notifyJob.start()
        .then(() => {
          expect(logger.info).toHaveBeenCalled();
          expect(logger.info).toHaveBeenCalledWith('(CRON): Notification skipped, either there were no offers to notify or the current offers have been already notified.');
          expect(logger.info).toHaveBeenCalledWith('(CRON): Next execution is scheduled for: time');
        });
    });
  });

  describe('getChannelsForEnabledGuilds()', () => {
    it('should resolve an Array of Channels.', () => {
      clientMock.dataProvider.get.mockResolvedValue(true);

      return notifier.getChannelsForEnabledGuilds()
        .then((channels) => {
          expect(channels).toBeInstanceOf(Array);

          channels.forEach((channel) => {
            expect(channel.id).toBe(channelMock.id);
          });
        });
    });
  });

  describe('filterValidOffers()', () => {
    it('should filter out offers that are null.', () => {
      const filtered = notifier.filterValidOffers([[offerMock], null, [offerMock, offerMock]]);

      expect(filtered).toHaveLength(3);
    });

    it('should filter out offers that are empty.', () => {
      const filtered = notifier.filterValidOffers([[offerMock], [], [offerMock, offerMock]]);

      expect(filtered).toHaveLength(3);
    });

    it('should return a flattened array with all the offers.', () => {
      const filtered = notifier.filterValidOffers([[offerMock], null, [offerMock, offerMock]]);

      expect(filtered).toEqual([offerMock, offerMock, offerMock]);
    });
  });

  describe('notify()', () => {
    beforeEach(() => {
      jest.spyOn(notifier, 'getChannelsForEnabledGuilds')
        .mockResolvedValue([channelMock, channelMock]);
    });

    it('should resolve false if no offers are notified.', () => {
      jest.spyOn(notifier, 'notifySingleOffer').mockResolvedValue(false);

      return notifier.notify()
        .then((result) => {
          expect(result).toBe(false);
        });
    });

    it('should resolve true if at least an offer is notified.', () => {
      jest.spyOn(notifier, 'notifySingleOffer').mockResolvedValue(true);

      return notifier.notify()
        .then((result) => {
          expect(result).toBe(true);
        });
    });
  });

  describe('notifySingleOffer()', () => {
    it('should resolve false if the offer is already notified.', () => {
      jest.spyOn(notifier.cache, 'isOfferCached').mockResolvedValue(true);

      return notifier.notifySingleOffer(offerMock, [channelMock])
        .then((result) => {
          expect(result).toBe(false);
        });
    });

    it('should skip the notification if offer is already notified.', () => {
      jest.spyOn(notifier.cache, 'isOfferCached').mockResolvedValue(true);

      return notifier.notifySingleOffer(offerMock, [channelMock])
        .then(() => {
          expect(channelMock.send).not.toHaveBeenCalled();
        });
    });

    it('should send a notification for the offer.', () => {
      jest.spyOn(notifier.cache, 'isOfferCached').mockResolvedValue(false);

      return notifier.notifySingleOffer(offerMock, [channelMock])
        .then(() => {
          expect(channelMock.send).toHaveBeenCalled();
          expect(channelMock.send.mock.calls[0][0]).toContain(offerMock.game);
        });
    });

    it('should log an error if channel.send rejects.', () => {
      const expectedError = new Error('Oops');

      jest.spyOn(notifier.cache, 'isOfferCached').mockResolvedValue(false);
      channelMock.send.mockRejectedValueOnce(expectedError);

      return notifier.notifySingleOffer(offerMock, [channelMock])
        .then(() => {
          expect(logger.error).toHaveBeenCalled();
          expect(logger.error).toHaveBeenCalledWith(expectedError);
          expect(logger.error.mock.calls[0][0]).toContain('Something happened');
        });
    });
  });
});
