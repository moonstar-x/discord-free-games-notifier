import { ExtendedClient } from '../base/client/ExtendedClient';

const client = {
  login: jest.fn()
} as unknown as ExtendedClient;

jest.mock('../app/client', () => {
  return {
    createClient: jest.fn().mockReturnValue(client)
  };
});

jest.mock('../config/app', () => {
  return {
    DISCORD_TOKEN: 'token'
  };
});

describe('Entrypoint > Start', () => {
  const load = async () => {
    jest.isolateModules(() => {
      require('./start');
    });
    await Promise.resolve();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login client with token.', async () => {
    await load();
    expect(client.login).toHaveBeenCalledWith('token');
  });
});
