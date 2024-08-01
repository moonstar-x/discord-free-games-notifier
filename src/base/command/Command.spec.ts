import { Command } from './Command';
import { ChatInputCommandInteraction, DMChannel, SlashCommandBuilder } from 'discord.js';
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
          description: 'description',
          emoji: ':a:',
          guildOnly: true,
          permissions: ['ManageGuild', 'ManageChannels'] as const,
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
        expect(command.description).toBe('description');
        expect(command.emoji).toBe(':a:');
        expect(command.guildOnly).toBe(true);
        expect(command.permissions).toStrictEqual(['ManageGuild', 'ManageChannels']);
        expect(command.builder).toBeInstanceOf(SlashCommandBuilder);
      });

      it('should set default options if not provided.', () => {
        class ConcreteDefaultCommand extends Command {
          public constructor(client: ExtendedClient) {
            super(client, {
              name: 'command',
              description: 'description',
              guildOnly: true,
              builder: new SlashCommandBuilder()
            });
          }

          public override run() {
            throw new Error();
          }
        }

        const command = new ConcreteDefaultCommand(client);

        expect(command.name).toBe('command');
        expect(command.description).toBe('description');
        expect(command.emoji).toBe(':robot:');
        expect(command.guildOnly).toBe(true);
        expect(command.permissions).toBeNull();
        expect(command.builder).toBeInstanceOf(SlashCommandBuilder);
      });

      it('should set properties to builder.', () => {
        const command = new ConcreteCommand(client);

        expect(command.builder.name).toBe('command');
        expect(command.builder.description).toBe('description');
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

    describe('hasPermission()', () => {
      const missingMock = jest.fn().mockReturnValue(undefined);
      const permissionsForMock = jest.fn().mockReturnValue({ missing: missingMock });

      const command = new ConcreteCommand(client);
      const interaction = {
        user: {
          id: '123'
        },
        channel: {
          permissionsFor: permissionsForMock
        }
      } as unknown as ChatInputCommandInteraction;

      it('should return true if command has no permissions set.', () => {
        const command = new ConcreteCommand(client);
        Object.defineProperty(command, 'permissions', { value: null });

        const result = command.hasPermission(interaction);
        expect(result).toBe(true);
      });

      it('should return true if interaction does not come from a channel.', () => {
        const result = command.hasPermission({ ...interaction, channel: null } as ChatInputCommandInteraction);
        expect(result).toBe(true);
      });

      it('should return true if interaction comes from a DM channel.', () => {
        const channel = Object.create(DMChannel.prototype);
        const result = command.hasPermission({ ...interaction, channel } as ChatInputCommandInteraction);

        expect(result).toBe(true);
      });

      it('should return true if interaction comes from a partial channel.', () => {
        const channel = { partial: true };
        const result = command.hasPermission({ ...interaction, channel } as ChatInputCommandInteraction);

        expect(result).toBe(true);
      });

      it('should return true if no permissions are missing.', () => {
        missingMock.mockReturnValueOnce([]);
        const result = command.hasPermission(interaction);

        expect(result).toBe(true);
      });

      it('should return error message if 1 permission is missing.', () => {
        missingMock.mockReturnValueOnce(['ManageGuild']);
        const result = command.hasPermission(interaction);

        expect(result).toBe('The command command requires you to have the permissions: ManageGuild.');
      });

      it('should return error message if multiple permissions are missing.', () => {
        missingMock.mockReturnValueOnce(['ManageGuild', 'ManageChannels']);
        const result = command.hasPermission(interaction);

        expect(result).toBe('The command command requires you to have the permissions: ManageGuild, ManageChannels.');
      });
    });
  });
});
