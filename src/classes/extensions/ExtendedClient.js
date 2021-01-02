const { CommandoClient } = require('discord.js-commando');
const logger = require('@greencoast/logger');
const { ACTIVITY_TYPE } = require('../../common/constants');

class ExtendedClient extends CommandoClient {
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

  isDebugEnabled() {
    return process.argv.includes('--debug');
  }
}

module.exports = ExtendedClient;
