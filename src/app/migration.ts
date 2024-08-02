import path from 'path';
import { runMigrationsForApp } from '../services/database/migration';

export const runMigrations = () => {
  const migrationsDirectory = path.join(__dirname, '../../migrations');
  return runMigrationsForApp(migrationsDirectory);
};
