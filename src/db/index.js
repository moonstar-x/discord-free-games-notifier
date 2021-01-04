const { SQLiteProvider } = require('discord.js-commando');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const logger = require('@greencoast/logger');
const fs = require('fs');
const path = require('path');
const { devMode } = require('../common/context');

const dataFolderPath = path.join(__dirname, '../../data');
const dbFilePath = path.join(dataFolderPath, 'data.sqlite');

const initializeDatabase = () => {
  if (!fs.existsSync(dataFolderPath)) {
    logger.warn('Data folder not found, creating...');
    fs.mkdirSync(dataFolderPath);
    logger.warn('Data folder created!');
  }

  if (!fs.existsSync(dbFilePath)) {
    logger.warn('Database file not found, creating...');
    fs.writeFileSync(dbFilePath, '');
    logger.warn('Database file created!');
  }
};

const connectDatabase = (client) => {
  initializeDatabase();

  return open({
    filename: dbFilePath,
    driver: sqlite3.Database
  })
    .then((db) => {
      return client.setProvider(new SQLiteProvider(db))
        .then(() => {
          logger.info('Database loaded.');
          client.updatePresence();

          if (devMode) {
            client.provider.clear('global');
            logger.debug('(DB): Cleared global keys from db.');
          }
        })
        .catch((error) => {
          logger.fatal('Could not set database as provider!');
          logger.fatal(error);
        });
    })
    .catch((error) => {
      logger.fatal('Could not load the database!');
      logger.fatal(error);
    });
};

const GUILD_KEYS = {
  channel: 'channel'
};

module.exports = {
  initializeDatabase,
  connectDatabase,
  GUILD_KEYS
};
