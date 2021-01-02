const logger = require('@greencoast/logger');
const fs = require('fs');
const sqlite = require('sqlite');
const { SQLiteProvider } = require('discord.js-commando');
const { initializeDatabase, connectDatabase } = require('../../src/db');
const { clientMock } = require('../../__mocks__/discordMocks');

const dbMock = 'db';

jest.mock('fs', () => {
  const realFs = jest.requireActual('fs');

  // Required since 'sqlite3' uses fs.existsSync on require.
  return {
    ...realFs,
    existsSync: jest.fn(realFs.existsSync),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn()
  };
});
jest.mock('@greencoast/logger');
jest.mock('sqlite', () => ({
  open: jest.fn(() => Promise.resolve(dbMock))
}));
jest.mock('discord.js-commando', () => ({
  SQLiteProvider: jest.fn()
}));

describe('DB', () => {
  describe('initializeDatabase()', () => {
    beforeEach(() => {
      logger.warn.mockClear();
      fs.existsSync.mockClear();
      fs.mkdirSync.mockClear();
      fs.writeFileSync.mockClear();
    });

    it('should create and log if data folder and database are not found.', () => {
      fs.existsSync.mockReturnValue(false);

      initializeDatabase();

      expect(logger.warn).toHaveBeenCalledTimes(4);
      expect(logger.warn).toHaveBeenCalledWith('Data folder not found, creating...');
      expect(logger.warn).toHaveBeenCalledWith('Data folder created!');
      expect(logger.warn).toHaveBeenCalledWith('Database file not found, creating...');
      expect(logger.warn).toHaveBeenCalledWith('Database file created!');
      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it('should create and log if the database file was not found.', () => {
      fs.existsSync.mockReturnValue(false);
      fs.existsSync.mockReturnValueOnce(true);

      initializeDatabase();

      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith('Database file not found, creating...');
      expect(logger.warn).toHaveBeenCalledWith('Database file created!');
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it('should not do anything if both the data folder and database file exists.', () => {
      fs.existsSync.mockReturnValue(true);

      initializeDatabase();

      expect(logger.warn).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    afterAll(() => {
      fs.existsSync.mockReturnValue(true);
    });
  });

  describe('connectDatabase()', () => {
    beforeEach(() => {
      logger.info.mockClear();
      logger.fatal.mockClear();
      sqlite.open.mockClear();
      SQLiteProvider.mockClear();
      clientMock.setProvider.mockClear();
      clientMock.updatePresence.mockClear();
    });

    it('should return a Promise.', () => {
      expect(connectDatabase(clientMock)).toBeInstanceOf(Promise);
    });

    it('should call client.setProvider when resolved.', () => {
      return connectDatabase(clientMock)
        .then(() => {
          expect(clientMock.setProvider).toHaveBeenCalledTimes(1);
          expect(SQLiteProvider).toHaveBeenCalledTimes(1);
          expect(SQLiteProvider).toHaveBeenCalledWith(dbMock);
          expect(clientMock.setProvider.mock.calls[0][0]).toBeInstanceOf(SQLiteProvider);
        });
    });

    it('should call client.updatePresence and log that the db has been loaded when resolved.', () => {
      return connectDatabase(clientMock)
        .then(() => {
          expect(clientMock.updatePresence).toHaveBeenCalledTimes(1);
          expect(logger.info).toHaveBeenCalledTimes(1);
          expect(logger.info).toHaveBeenCalledWith('Database loaded.');
        });
    });

    it('should log that database could not be set as provider if the setProvider rejects.', () => {
      const error = new Error('Oops');
      clientMock.setProvider.mockRejectedValueOnce(error);

      return connectDatabase(clientMock)
        .then(() => {
          expect(logger.fatal).toHaveBeenCalledTimes(2);
          expect(logger.fatal).toHaveBeenCalledWith(error);
          expect(logger.fatal).toHaveBeenCalledWith('Could not set database as provider!');
        });
    });

    it('should log that database could not be loaded if the open rejects.', () => {
      const error = new Error('Oops');
      sqlite.open.mockRejectedValueOnce(error);

      return connectDatabase(clientMock)
        .then(() => {
          expect(logger.fatal).toHaveBeenCalledTimes(2);
          expect(logger.fatal).toHaveBeenCalledWith(error);
          expect(logger.fatal).toHaveBeenCalledWith('Could not load the database!');
        });
    });
  });
});
