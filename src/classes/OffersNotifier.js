const logger = require('@greencoast/logger');
const { CronJob } = require('cron');
const { CRON, GUILD_KEYS } = require('../common/constants');
const { DEV_MODE } = require('../common/context');
const ProviderFactory = require('./providers/ProviderFactory');

class OffersNotifier {
  constructor(client) {
    this.client = client;
    this.notifyJob = null;
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
    const allOffers = this.filterValidOffers(await Promise.all(providers.map((provider) => provider.getOffers())));

    let atLeastOneOfferNotified = false;

    for (const offer of allOffers) {
      const notified = await this.notifySingleOffer(offer, channels);

      if (!atLeastOneOfferNotified) {
        atLeastOneOfferNotified = notified;
      }
    }

    this.updateNotifiedCache(allOffers);

    return atLeastOneOfferNotified;
  }

  async notifySingleOffer(offer, channels) {
    const alreadyNotified = await this.client.dataProvider.getGlobal(`notified-${offer.id}`, false);

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

  async updateNotifiedCache(allOffers) {
    await this.client.dataProvider.clearGlobal();

    allOffers.forEach((offer) => {
      this.client.dataProvider.setGlobal(`notified-${offer.id}`, true);
    });
  }
}

module.exports = OffersNotifier;