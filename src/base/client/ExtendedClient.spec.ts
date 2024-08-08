import { ExtendedClient } from './ExtendedClient';
import { GatewayIntentBits, Interaction } from 'discord.js';

jest.mock('../command/InteractionDispatcher', () => {
  return {
    InteractionDispatcher: jest.fn().mockImplementation(() => {
      return {
        handleInteraction: jest.fn()
      };
    })
  };
});

jest.mock('../../features/gameOffers/classes/OffersNotifier', () => {
  return {
    OffersNotifier: jest.fn().mockImplementation(() => {
      return {
        subscribe: jest.fn()
      };
    })
  };
});

describe('Base > Client > ExtendedClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('class ExtendedClient', () => {
    it('should be defined.', () => {
      expect(ExtendedClient).toBeDefined();
    });

    describe('constructor', () => {
      it('should register interactionCreate on construction.', () => {
        const client = new ExtendedClient({ intents: [] as ReadonlyArray<GatewayIntentBits> });
        const interaction = {} as Interaction;

        client.emit('interactionCreate', interaction);
        expect(client.dispatcher.handleInteraction).toHaveBeenCalledWith(interaction);
      });

      it('should register ready on construction.', () => {
        const client = new ExtendedClient({ intents: [] as ReadonlyArray<GatewayIntentBits> });

        client.emit('ready' as unknown as never);
        expect(client.notifier.subscribe).toHaveBeenCalled();
      });
    });
  });
});
