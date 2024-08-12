import { createDeployClient } from './deploy';
import { GatewayIntentBits } from 'discord.js';
import { ExtendedClient } from '../base/client/ExtendedClient';

const client = {
  registry: {
    registerIn: jest.fn()
  }
};

jest.mock('../base/client/ExtendedClient', () => {
  return {
    ExtendedClient: jest.fn().mockImplementation(() => {
      return client;
    })
  };
});

describe('App > Deploy', () => {
  describe('createDeployClient()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined.', () => {
      expect(createDeployClient).toBeDefined();
    });

    it('should create a client with the correct intents.', () => {
      createDeployClient();

      expect(ExtendedClient).toHaveBeenCalledWith({
        intents: [GatewayIntentBits.Guilds]
      });
    });

    it('should register commands in the correct folder.', () => {
      createDeployClient();

      const call = client.registry.registerIn.mock.calls[0];
      expect(call[0]).toMatch(/commands$/);
    });
  });
});
