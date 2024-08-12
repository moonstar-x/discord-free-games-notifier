/* eslint-disable no-underscore-dangle */
import { runMigrations, runMigrationsForApp } from './migration';
import * as thisModule from './migration';
import fs from 'fs';
import logger from '@moonstar-x/logger';
import { db } from './client';

jest.mock('@moonstar-x/logger');
jest.mock('fs');
jest.mock('./client');

describe('Services > Database > Migration', () => {
  const txMock = (db as unknown as { _txMock: Record<string, jest.Mock> })._txMock;

  describe('runMigrations()', () => {
    beforeAll(() => {
      (fs.promises.stat as jest.Mock).mockResolvedValue({ isDirectory: () => true });
      (fs.promises.readdir as jest.Mock).mockResolvedValue(['migration-1.sql', 'other.js', 'new-migration-2.sql']);
      (fs.promises.readFile as jest.Mock).mockResolvedValue('');
    });

    beforeEach(() => {
      (db.tx as jest.Mock).mockClear();
      (txMock.one as jest.Mock).mockClear();
      (txMock.multi as jest.Mock).mockClear();
    });

    afterAll(() => {
      (fs.promises.stat as jest.Mock).mockReset();
      (fs.promises.readdir as jest.Mock).mockReset();
      (fs.promises.readFile as jest.Mock).mockReset();
    });

    it('should be defined.', () => {
      expect(runMigrations).toBeDefined();
    });

    it('should reject an error if directory is not a valid directory.', () => {
      (fs.promises.stat as jest.Mock).mockResolvedValueOnce({ isDirectory: () => false });
      expect(runMigrations('')).rejects.toThrow('Migrations directory provided does not exist or is not a directory.');
    });

    it('should reject an error if directory is empty.', () => {
      (fs.promises.readdir as jest.Mock).mockResolvedValueOnce([]);
      expect(runMigrations('')).rejects.toThrow('Migrations directory is empty.');
    });

    it('should create the migrations table.', async () => {
      await runMigrations('');
      expect(db.tx).toHaveBeenCalled();
      expect(txMock.any).toHaveBeenCalledWith('CREATE TABLE IF NOT EXISTS __migrations(id SERIAL PRIMARY KEY, name VARCHAR(256) NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    });

    it('should only apply new migrations.', async () => {
      (db.manyOrNone as jest.Mock).mockResolvedValueOnce([{ name: 'migration-1.sql' }]);
      (fs.promises.readFile as jest.Mock).mockResolvedValueOnce('my query');

      await runMigrations('');
      expect(db.tx).toHaveBeenCalled();
      expect(txMock.multi).toHaveBeenCalledWith('my query');
      expect(txMock.one).toHaveBeenCalledWith('INSERT INTO __migrations(name) VALUES($1) RETURNING *', ['new-migration-2.sql']);
    });

    it('should resolve an array of the new migrations.', async () => {
      (db.manyOrNone as jest.Mock).mockResolvedValueOnce([{ name: 'migration-1.sql' }]);
      (txMock.one as jest.Mock).mockResolvedValue({ name: 'new-migration-2.sql' });

      expect(await runMigrations('')).toStrictEqual([{ name: 'new-migration-2.sql' }]);

      (txMock.one as jest.Mock).mockReset();
    });
  });

  describe('runMigrationsForApp()', () => {
    let runMigrationsSpy: jest.SpyInstance;

    beforeAll(() => {
      runMigrationsSpy = jest.spyOn(thisModule, 'runMigrations', undefined as never);
      runMigrationsSpy.mockResolvedValue([]);
    });

    afterAll(() => {
      runMigrationsSpy.mockRestore();
    });

    it('should be defined.', () => {
      expect(runMigrationsForApp).toBeDefined();
    });

    it('should log the migrations.', async () => {
      runMigrationsSpy.mockResolvedValueOnce([{ name: 'migration-1.sql' }, { name: 'migration-2.sql' }]);
      await runMigrationsForApp('');

      expect(logger.info).toHaveBeenCalledWith('New migration applied: migration-1.sql');
      expect(logger.info).toHaveBeenCalledWith('New migration applied: migration-2.sql');
    });

    it('should return the migrations.', async () => {
      const migrations = [{ name: 'migration-1.sql' }, { name: 'migration-2.sql' }];
      runMigrationsSpy.mockResolvedValueOnce(migrations);

      expect(await runMigrationsForApp('')).toBe(migrations);
    });
  });
});
