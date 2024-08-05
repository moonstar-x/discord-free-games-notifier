import { Command } from './Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '../client/ExtendedClient';

describe('Base > Command > Command', () => {
  const client = {
    emit: jest.fn()
  } as unknown as ExtendedClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('class Command', () => {
    class ConcreteCommand extends Command {
      public constructor(client: ExtendedClient) {
        super(client, {
          name: 'command',
          builder: new SlashCommandBuilder()
        });
      }

      public override run() {
        throw new Error();
      }
    }

    it('should be defined.', () => {
      expect(Command).toBeDefined();
    });

    describe('constructor', () => {
      it('should set options as properties.', () => {
        const command = new ConcreteCommand(client);

        expect(command.name).toBe('command');
        expect(command.builder).toBeInstanceOf(SlashCommandBuilder);
      });
    });

    describe('onError()', () => {
      const command = new ConcreteCommand(client);
      const error = new Error('Oops!');
      const interaction = {
        editReply: jest.fn(),
        reply: jest.fn()
      } as unknown as ChatInputCommandInteraction;

      it('should emit commandError with error.', async () => {
        await command.onError(error, interaction);
        expect(client.emit).toHaveBeenCalledWith('commandError', error, command, interaction);
      });

      it('should edit reply with error message if interaction is deferred.', async () => {
        await command.onError(error, { ...interaction, deferred: true } as ChatInputCommandInteraction);
        expect(interaction.editReply).toHaveBeenCalledWith({ content: 'An error has occurred when running the command command.' });
      });

      it('should edit reply with error message if interaction is replied.', async () => {
        await command.onError(error, { ...interaction, replied: true } as ChatInputCommandInteraction);
        expect(interaction.editReply).toHaveBeenCalledWith({ content: 'An error has occurred when running the command command.' });
      });

      it('should reply with error message if interaction is not deferred or replied.', async () => {
        await command.onError(error, { ...interaction, deferred: false, replied: false } as ChatInputCommandInteraction);
        expect(interaction.reply).toHaveBeenCalledWith({ content: 'An error has occurred when running the command command.' });
      });
    });
  });
});
