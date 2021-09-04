const logger = require('@greencoast/logger');
const { CronJob } = require('cron');
const { CRON, GUILD_KEYS } = require('../common/constants');
const { DEV_MODE } = require('../common/context');
const ProviderFactory = require('./providers/ProviderFactory');
const OffersCache = require('./OffersCache');

class OffersNotifier {
  constructor(client) {
    this.client = client;
    this.notifyJob = null;
    this.cache = new OffersCache(client.dataProvider);
  }

  initialize() {
    const self = this;
    
    this.notifyJob = new CronJob(DEV_MODE ? CRON.EVERY_MINUTE : CRON.EVERY_30_MINS, async function() {
      logger.info('(CRON): Notifying enabled guilds...');
      return this.onComplete(await self.notify());
    }, function(notified) {
      logger.info(notified ? '(CRON): Notification complete.' : '(CRON): Notification skipped, either there were no offers to notify or the current offers have been already notified.');
      logger.info(`(CRON): Next execution is scheduled for: ${this.nextDate().format(CRON.MOMENT_DATE_FORMAT)}`);
    }, true);

    this.notifyJob.start();
    logger.info('(CRON): Notification job initialized.');
    logger.info(`(CRON): Next execution is scheduled for: ${this.notifyJob.nextDate().format(CRON.MOMENT_DATE_FORMAT)}`);
  }

  getChannelsForEnabledGuilds() {
    return this.client.guilds.cache.reduce(async(channels, guild) => {
      const channelID = await this.client.dataProvider.get(guild, GUILD_KEYS.channel, null);

      if (channelID) {
        const channel = guild.channels.cache.get(channelID);

        if (channel) {
          return [...await channels, channel];
        }
      }

      return channels;
    }, []);
  }

  filterValidOffers(allOffersByProvider) {
    return allOffersByProvider.reduce((all, offers) => {
      if (offers) {
        all.push(...offers);
      }

      return all;
    }, []);
  }

  async notify() {
    const providers = ProviderFactory.getAll();
    const channels = await this.getChannelsForEnabledGuilds();
    const currentOffers = this.filterValidOffers(await Promise.all(providers.map((provider) => provider.getOffers())));

    let atLeastOneOfferNotified = false;

    for (const offer of currentOffers) {
      const notified = await this.notifySingleOffer(offer, channels);

      if (!atLeastOneOfferNotified) {
        atLeastOneOfferNotified = notified;
      }
    }

    this.cache.update(currentOffers);

    return atLeastOneOfferNotified;
  }

  async notifySingleOffer(offer, channels) {
    const alreadyNotified = await this.cache.isOfferCached(offer);

    if (alreadyNotified) {
      return false;
    }

    channels.forEach((channel) => {
      channel.send(`${offer.game} is free to keep on ${offer.provider}, you can grab it from here: ${offer.url}`)
        .catch((error) => {
          logger.error(`Something happened when trying to notify ${channel.name} from ${channel.guild.name}, perhaps I don't have enough permissions to send the message?`);
          logger.error(error);
        });
    });

    return true;
  }
}

module.exports = OffersNotifier;
