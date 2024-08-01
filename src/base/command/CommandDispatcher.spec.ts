import { CommandDispatcher } from './CommandDispatcher';
import { ChatInputCommandInteraction } from 'discord.js';
import logger from '@moonstar-x/logger';
import { ExtendedClient } from '../client/ExtendedClient';
import { Command } from './Command';

jest.mock('@moonstar-x/logger');

describe('Base > Command > CommandDispatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('class CommandDispatcher', () => {
    const client = {
      emit: jest.fn(),
      registry: {
        get: jest.fn()
      }
    } as unknown as ExtendedClient;

    it('should be defined.', () => {
      expect(CommandDispatcher).toBeDefined();
    });

    describe('handleInteraction()', () => {
      const dispatcher = new CommandDispatcher(client, client.registry);

      const interaction = {
        isChatInputCommand: jest.fn().mockReturnValue(true),
        inGuild: jest.fn().mockReturnValue(true),
        reply: jest.fn()
      } as unknown as ChatInputCommandInteraction;

      const command = {
        name: 'command',
        guildOnly: false,
        run: jest.fn(),
        hasPermission: jest.fn().mockReturnValue(true),
        onError: jest.fn()
      } as unknown as Command;

      beforeAll(() => {
        (client.registry.get as jest.Mock).mockReturnValue(command);
      });

      afterAll(() => {
        (client.registry.get as jest.Mock).mockReset();
      });

      it('should not execute command if interaction is not a chat input command.', async () => {
        (interaction.isChatInputCommand as unknown as jest.Mock).mockReturnValueOnce(false);
        await dispatcher.handleInteraction(interaction);

        expect(client.emit).not.toHaveBeenCalled();
        expect(command.run).not.toHaveBeenCalled();
      });

      it('should not execute command if registry cannot find it.', async () => {
        (client.registry.get as jest.Mock).mockReturnValueOnce(null);
        await dispatcher.handleInteraction(interaction);

        expect(client.emit).not.toHaveBeenCalled();
        expect(command.run).not.toHaveBeenCalled();
      });

      it('should reply interaction and not execute command if command is guildOnly and interaction was not sent in guild.', async () => {
        (client.registry.get as jest.Mock).mockReturnValueOnce({ ...command, guildOnly: true });
        (interaction.inGuild as unknown as jest.Mock).mockReturnValueOnce(false);
        await dispatcher.handleInteraction(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({ content: 'I can only run this from a server.' });
        expect(client.emit).not.toHaveBeenCalled();
        expect(command.run).not.toHaveBeenCalled();
      });

      it('should reply interaction and not execute command if author has no permission to execute.', async () => {
        (command.hasPermission as jest.Mock).mockReturnValueOnce('No permissions.');
        await dispatcher.handleInteraction(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({ content: 'No permissions.' });
        expect(client.emit).not.toHaveBeenCalled();
        expect(command.run).not.toHaveBeenCalled();
      });

      it('should execute command if all is well.', async () => {
        await dispatcher.handleInteraction(interaction);

        expect(client.emit).toHaveBeenCalledWith('commandExecute', command, interaction);
        expect(command.run).toHaveBeenCalledWith(interaction);
      });

      it('should handle error with command.onError if run fails.', async () => {
        const error = new Error('Oops!');
        (command.run as jest.Mock).mockRejectedValueOnce(error);
        await dispatcher.handleInteraction(interaction);

        expect(client.emit).toHaveBeenCalledWith('commandExecute', command, interaction);
        expect(command.run).toHaveBeenCalledWith(interaction);
        expect(command.onError).toHaveBeenCalledWith(error, interaction);
      });

      it('should log error if command.onError fails.', async () => {
        const originalError = new Error('Oops!');
        const innerError = new Error('Ouch!');
        (command.run as jest.Mock).mockRejectedValueOnce(originalError);
        (command.onError as jest.Mock).mockRejectedValueOnce(innerError);
        await dispatcher.handleInteraction(interaction);

        expect(client.emit).toHaveBeenCalledWith('commandExecute', command, interaction);
        expect(command.run).toHaveBeenCalledWith(interaction);
        expect(command.onError).toHaveBeenCalledWith(originalError, interaction);
        expect(logger.error).toHaveBeenCalledWith('There was an error in the command execution for command.', originalError);
        expect(logger.error).toHaveBeenCalledWith('Additionally, the error handling could not complete.', innerError);
      });
    });
  });
});
