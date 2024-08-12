import * as configModule from './app';

describe('Config > App', () => {
  let config: typeof configModule;

  const oldEnv = { ...process.env };
  const mockedEnv = {
    DISCORD_TOKEN: 'token',
    DISCORD_PRESENCE_INTERVAL: '10000',
    DISCORD_SHARDING_ENABLED: 'true',
    DISCORD_SHARDING_COUNT: '5',
    REDIS_URI: 'redis://localhost:6379',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5431',
    POSTGRES_USER: 'user',
    POSTGRES_PASSWORD: 'password',
    POSTGRES_DATABASE: 'db',
    POSTGRES_MAX_SHARD_CONNECTIONS: '30'
  };

  const resetModule = () => {
    jest.resetModules();
    config = require('./app');
  };

  beforeEach(() => {
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

  it('should export valid DISCORD_PRESENCE_INTERVAL.', () => {
    expect(config.DISCORD_PRESENCE_INTERVAL).toBe(10000);
  });

  it('should export valid DISCORD_PRESENCE_INTERVAL if no value is provided.', () => {
    process.env = { ...mockedEnv, DISCORD_PRESENCE_INTERVAL: undefined as unknown as string };
    resetModule();

    expect(config.DISCORD_PRESENCE_INTERVAL).toBe(5 * 60 * 1000);
  });

  it('should export valid DISCORD_SHARDING_ENABLED.', () => {
    expect(config.DISCORD_SHARDING_ENABLED).toBe(true);
  });

  it('should export valid DISCORD_SHARDING_COUNT.', () => {
    expect(config.DISCORD_SHARDING_COUNT).toBe(5);
  });

  it('should export valid DISCORD_SHARDING_COUNT if no value is provided.', () => {
    process.env = { ...mockedEnv, DISCORD_SHARDING_COUNT: undefined as unknown as string };
    resetModule();

    expect(config.DISCORD_SHARDING_COUNT).toBe('auto');
  });

  it('should export valid REDIS_URI.', () => {
    expect(config.REDIS_URI).toBe('redis://localhost:6379');
  });

  it('should export valid POSTGRES_HOST.', () => {
    expect(config.POSTGRES_HOST).toBe('localhost');
  });

  it('should export valid POSTGRES_PORT.', () => {
    expect(config.POSTGRES_PORT).toBe(5431);
  });

  it('should export valid POSTGRES_PORT if no value is provided.', () => {
    process.env = { ...mockedEnv, POSTGRES_PORT: undefined as unknown as string };
    resetModule();

    expect(config.POSTGRES_PORT).toBe(5432);
  });

  it('should export valid POSTGRES_USER.', () => {
    expect(config.POSTGRES_USER).toBe('user');
  });

  it('should export valid POSTGRES_PASSWORD.', () => {
    expect(config.POSTGRES_PASSWORD).toBe('password');
  });

  it('should export valid POSTGRES_DATABASE.', () => {
    expect(config.POSTGRES_DATABASE).toBe('db');
  });

  it('should export valid POSTGRES_MAX_SHARD_CONNECTIONS.', () => {
    expect(config.POSTGRES_MAX_SHARD_CONNECTIONS).toBe(30);
  });

  it('should export valid POSTGRES_MAX_SHARD_CONNECTIONS if no value is provided.', () => {
    process.env = { ...mockedEnv, POSTGRES_MAX_SHARD_CONNECTIONS: undefined as unknown as string };
    resetModule();

    expect(config.POSTGRES_MAX_SHARD_CONNECTIONS).toBe(15);
  });
});
