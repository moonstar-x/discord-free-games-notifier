import { runMigrations } from './migration';
import { runMigrationsForApp } from '../services/database/migration';

jest.mock('../services/database/migration', () => {
  return {
    runMigrationsForApp: jest.fn().mockImplementation(() => Promise.resolve())
  };
});

describe('App > Migration', () => {
  describe('runMigrations()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined.', () => {
      expect(runMigrations).toBeDefined();
    });

    it('should call runMigrations with correct path.', async () => {
      await runMigrations();

      const call = (runMigrationsForApp as jest.Mock).mock.calls[0];
      expect(call[0]).toMatch(/\/migrations$/);
    });
  });
});
