import fs from 'fs';
import path from 'path';
import logger from '@moonstar-x/logger';
import { db } from './client';

export interface Migration {
  id: number
  name: string
  created_at: Date
}

const getMigrationFiles = async (directory: string): Promise<string[]> => {
  const directoryStat = await fs.promises.stat(directory);
  if (!directoryStat.isDirectory()) {
    throw new Error('Migrations directory provided does not exist or is not a directory.');
  }

  const files = await fs.promises.readdir(directory);
  return files.filter((file) => file.endsWith('.sql'));
};

const initializeMigrationTable = async () => {
  await db.tx(async (t) => {
    const statement = `CREATE TABLE IF NOT EXISTS __migrations(id SERIAL PRIMARY KEY, name VARCHAR(256) NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
    await t.any(statement);
  });
};

const getNewMigrations = async (migrations: string[]): Promise<string[]> => {
  const query = 'SELECT * FROM __migrations';
  const storedMigrations = await db.manyOrNone<Migration>(query);

  const storedMigrationsSet = new Set(storedMigrations.map((migration) => migration.name));

  return migrations.filter((migration) => !storedMigrationsSet.has(migration));
};

const applyMigrations = async (migrationsDirectory: string, migrations: string[]): Promise<Migration[]> => {
  return await db.tx(async (t) => {
    return await Promise.all(migrations.map(async (migrationName) => {
      const migrationFilename = path.join(migrationsDirectory, migrationName);
      const migrationStatement = await fs.promises.readFile(migrationFilename, { encoding: 'utf-8' });
      await t.multi(migrationStatement);

      const query = 'INSERT INTO __migrations(name) VALUES($1) RETURNING *';
      return await t.one<Migration>(query, [migrationName]);
    }));
  });
};

export const runMigrations = async (migrationsDirectory: string): Promise<Migration[]> => {
  const migrations = await getMigrationFiles(migrationsDirectory);

  if (!migrations.length) {
    throw new Error('Migrations directory is empty.');
  }

  await initializeMigrationTable();
  const newMigrations = await getNewMigrations(migrations);

  if (!newMigrations.length) {
    return [];
  }

  return applyMigrations(migrationsDirectory, newMigrations);
};

export const runMigrationsForApp = async (migrationsDirectory: string): Promise<Migration[]> => {
  const newMigrations = await runMigrations(migrationsDirectory);

  newMigrations.forEach((migration) => {
    logger.info(`New migration applied: ${migration.name}`);
  });

  return newMigrations;
};
