const { CommandoClient } = require('discord.js-commando');
const logger = require('@greencoast/logger');
const { CronJob } = require('cron');
const { ACTIVITY_TYPE, CRON } = require('../../common/constants');
const { devMode } = require('../../common/context');
const { GUILD_KEYS } = require('../../db');
const ProviderFactory = require('../providers/ProviderFactory');

class ExtendedClient extends CommandoClient {
  constructor(options) {
    super(options);

    this.notifyJob = null;
  }

  updatePresence() {
    const numOfGuilds = this.guilds.cache.reduce((sum) => sum + 1, 0);
    const presence = `${numOfGuilds} servers!`;

    return this.user.setPresence({
      activity: {
        name: presence,
        type: ACTIVITY_TYPE.playing
      }
    })
      .then(() => {
        logger.info(`Presence updated to: ${presence}`);
      }).catch((error) => {
        logger.error(error);
      });
  }

  handleCommandError(error, info) {
    logger.error(info);
    logger.error(error);
  }

  getChannelsForEnabledGuilds() {
    return this.guilds.cache.reduce((channels, guild) => {
      const channelID = this.provider.get(guild.id, GUILD_KEYS.channel, null);
      if (channelID) {
        const channel = guild.channels.cache.find((c) => c.id === channelID);
        if (channel) {
          channels.push(channel);
        }
      }
      return channels;
    }, []);
  }

  notifyOffers() {
    const providers = ProviderFactory.getAll();
    const announcementChannels = this.getChannelsForEnabledGuilds();
    const allOffers = [];

    return Promise.all(providers.map((provider) => {
      return provider.getOffers()
        .then((offers) => {
          let notified = false;

          if (!offers || offers.length < 1) {
            return notified;
          }

          offers.forEach((offer) => {
            allOffers.push(offer);

            const alreadyNotified = this.provider.get('global', `notified-${offer.id}`, false);

            if (alreadyNotified) {
              return;
            }

            announcementChannels.forEach((channel) => {
              channel.send(`${offer.game} is free to keep on ${offer.provider}, you can grab it from here: ${offer.url}`)
                .catch((error) => {
                  logger.error(`Something happened when trying to notify ${channel.name} from ${channel.guild.name}, perhaps I don't have enough permissions to send the message?`);
                  logger.error(error);
                });
            });
            
            notified = true;
          });

          return notified;
        });
    }))
      .then((offersNotified) => {
        this.provider.clear('global');
        allOffers.forEach((offer) => {
          this.provider.set('global', `notified-${offer.id}`, true);
        });

        return offersNotified.some((notified) => notified);
      });
  }

  initializeNotifyJob() {
    const client = this;
    this.notifyJob = new CronJob(devMode ? CRON.EVERY_MINUTE : CRON.EVERY_30_MINS, function() {
      logger.info('(CRON): Notifying enabled guilds...');
      return client.notifyOffers()
        .then((notified) => {
          this.onComplete(notified);
        });
    }, function(notified) {
      logger.info(notified ? '(CRON): Notification complete.' : '(CRON): Notification skipped, either there were no offers to notify or the offers have been already notified.');
      logger.info(`(CRON): Next execution is scheduled for: ${this.nextDate().format(CRON.MOMENT_DATE_FORMAT)}`);
    }, true);

    this.notifyJob.start();
    logger.info('(CRON): Notification job initialized.');
    logger.info(`(CRON): Next execution is scheduled for: ${this.notifyJob.nextDate().format(CRON.MOMENT_DATE_FORMAT)}`);
  }
}

module.exports = ExtendedClient;
