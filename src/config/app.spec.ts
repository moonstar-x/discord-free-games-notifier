import * as configModule from './app';

describe('Config > App', () => {
  let config: typeof configModule;

  const oldEnv = { ...process.env };
  const mockedEnv = {
    DISCORD_TOKEN: 'token'
  };

  const resetModule = () => {
    jest.resetModules();
    config = require('./app');
  };

  beforeAll(() => {
    process.env = mockedEnv;
    resetModule();
  });

  afterAll(() => {
    process.env = oldEnv;
    resetModule();
  });

  it('should export valid DISCORD_TOKEN.', () => {
    expect(config.DISCORD_TOKEN).toBe('token');
  });
});
