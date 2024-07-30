import * as configModule from './app';

describe('Config > App', () => {
  let config: typeof configModule;

  const oldEnv = { ...process.env };
  const mockedEnv = {
    DISCORD_TOKEN: 'token'
  };

  beforeAll(() => {
    process.env = mockedEnv;
    jest.resetModules();
    config = require('./app');
  });

  afterAll(() => {
    process.env = oldEnv;
    jest.resetModules();
    config = require('./app');
  });

  it('should export valid DISCORD_TOKEN.', () => {
    expect(config.DISCORD_TOKEN).toBe('token');
  });
});
