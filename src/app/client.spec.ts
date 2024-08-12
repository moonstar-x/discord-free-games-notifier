import { createClient } from './client';
import { GatewayIntentBits } from 'discord.js';
import { ExtendedClient } from '../base/client/ExtendedClient';
import * as ClientEventHandlers from '../base/client/ClientEventHandlers';
import * as context from '../config/context';

const client = {
  registry: {
    registerIn: jest.fn()
  },
  on: jest.fn()
};

jest.mock('../base/client/ExtendedClient', () => {
  return {
    ExtendedClient: jest.fn().mockImplementation(() => {
      return client;
    })
  };
});

describe('App > Client', () => {
  describe('createClient()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined.', () => {
      expect(createClient).toBeDefined();
    });

    it('should create a client with the correct intents.', () => {
      createClient();

      expect(ExtendedClient).toHaveBeenCalledWith({
        intents: [GatewayIntentBits.Guilds]
      });
    });

    it('should register commands in the correct folder.', () => {
      createClient();

      const call = client.registry.registerIn.mock.calls[0];
      expect(call[0]).toMatch(/commands$/);
    });

    it('should register debug event if debug is enabled.', () => {
      Object.defineProperty(context, 'DEBUG_ENABLED', { value: true });
      createClient();

      expect(client.on).toHaveBeenCalledWith('debug', ClientEventHandlers.handleDebug);
    });

    it('should not register debug event if debug is disabled.', () => {
      Object.defineProperty(context, 'DEBUG_ENABLED', { value: false });
      createClient();

      expect(client.on).not.toHaveBeenCalledWith('debug', ClientEventHandlers.handleDebug);
    });

    it('should register client events.', () => {
      createClient();

      expect(client.on).toHaveBeenCalledWith('error', ClientEventHandlers.handleError);
      expect(client.on).toHaveBeenCalledWith('guildCreate', ClientEventHandlers.handleGuildCreate);
      expect(client.on).toHaveBeenCalledWith('guildDelete', ClientEventHandlers.handleGuildDelete);
      expect(client.on).toHaveBeenCalledWith('guildUnavailable', ClientEventHandlers.handleGuildUnavailable);
      expect(client.on).toHaveBeenCalledWith('ready', ClientEventHandlers.handleReady);
      expect(client.on).toHaveBeenCalledWith('warn', ClientEventHandlers.handleWarn);
      expect(client.on).toHaveBeenCalledWith('commandExecute', ClientEventHandlers.handleCommandExecute);
      expect(client.on).toHaveBeenCalledWith('commandError', ClientEventHandlers.handleCommandError);
      expect(client.on).toHaveBeenCalledWith('commandRegistered', ClientEventHandlers.handleCommandRegistered);
    });
  });
});
