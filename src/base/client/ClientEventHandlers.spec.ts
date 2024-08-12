import * as ClientEventHandlers from './ClientEventHandlers';
import logger from '@moonstar-x/logger';
import { ChatInputCommandInteraction, Guild, GuildMember, User } from 'discord.js';
import { Command } from '../command/Command';
import { deleteGuild } from '../../features/gameOffers/functions/deleteGuild';

jest.mock('@moonstar-x/logger');

jest.mock('../../features/gameOffers/functions/deleteGuild', () => {
  return {
    deleteGuild: jest.fn().mockImplementation(() => Promise.resolve())
  };
});

describe('Base > Client > ClientEventHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ClientEventHandlers.handleDebug()', () => {
    it('should be defined.', () => {
      expect(ClientEventHandlers.handleDebug).toBeDefined();
    });

    it('should log debug message.', () => {
      const message = 'something';
      ClientEventHandlers.handleDebug(message);

      expect(logger.debug).toHaveBeenCalledWith(message);
    });
  });

  describe('ClientEventHandlers.handleError()', () => {
    it('should be defined.', () => {
      expect(ClientEventHandlers.handleError).toBeDefined();
    });

    it('should log error.', () => {
      const error = new Error('Oops!');
      ClientEventHandlers.handleError(error);

      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('ClientEventHandlers.handleGuildCreate()', () => {
    const guild = { name: 'Guild' } as Guild;

    it('should be defined.', () => {
      expect(ClientEventHandlers.handleGuildCreate).toBeDefined();
    });

    it('should log guild join.', () => {
      ClientEventHandlers.handleGuildCreate(guild);
      expect(logger.info).toHaveBeenCalledWith('Joined guild Guild.');
    });
  });

  describe('ClientEventHandlers.handleGuildDelete()', () => {
    const guild = { name: 'Guild', id: '123' } as Guild;

    it('should be defined.', () => {
      expect(ClientEventHandlers.handleGuildDelete).toBeDefined();
    });

    it('should log guild leave.', async () => {
      await ClientEventHandlers.handleGuildDelete(guild);
      expect(logger.info).toHaveBeenCalledWith('Left guild Guild.');
    });

    it('should delete guild data.', async () => {
      await ClientEventHandlers.handleGuildDelete(guild);
      expect(deleteGuild).toHaveBeenCalledWith('123');
    });

    it('should log guild data delete.', async () => {
      await ClientEventHandlers.handleGuildDelete(guild);
      expect(logger.info).toHaveBeenCalledWith('Deleted guild data for Guild.');
    });


    it('should error log if delete guild data fails.', async () => {
      const error = new Error('Oops!');
      (deleteGuild as jest.Mock).mockRejectedValueOnce(error);

      await ClientEventHandlers.handleGuildDelete(guild);
      expect(logger.error).toHaveBeenCalledWith('Could not delete guild data for Guild.');
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('ClientEventHandlers.handleGuildUnavailable()', () => {
    const guild = { name: 'Guild' } as Guild;

    it('should be defined.', () => {
      expect(ClientEventHandlers.handleGuildUnavailable).toBeDefined();
    });

    it('should log guild unavailable.', () => {
      ClientEventHandlers.handleGuildUnavailable(guild);
      expect(logger.warn).toHaveBeenCalledWith('Guild Guild is unavailable.');
    });
  });

  describe('ClientEventHandlers.handleReady()', () => {
    it('should be defined.', () => {
      expect(ClientEventHandlers.handleReady).toBeDefined();
    });

    it('should log ready message.', () => {
      ClientEventHandlers.handleReady();
      expect(logger.info).toHaveBeenCalledWith('Connected to Discord - Ready!');
    });
  });

  describe('ClientEventHandlers.handleWarn()', () => {
    it('should be defined.', () => {
      expect(ClientEventHandlers.handleWarn).toBeDefined();
    });

    it('should log warning.', () => {
      const message = 'Warning';
      ClientEventHandlers.handleWarn(message);

      expect(logger.warn).toHaveBeenCalledWith(message);
    });
  });

  describe('ClientEventHandlers.handleCommandExecute()', () => {
    const member = Object.create(GuildMember.prototype);
    Object.defineProperty(member, 'displayName', { value: 'Author' });

    const user = Object.create(User.prototype);
    Object.defineProperty(user, 'displayName', { value: 'Author' });

    const command = { name: 'Command' } as Command;
    const interaction = {
      guild: { name: 'Guild' } as Guild,
      member,
      user
    } as ChatInputCommandInteraction;

    it('should be defined.', () => {
      expect(ClientEventHandlers.handleCommandExecute).toBeDefined();
    });

    it('should log execution with member displayName if author is GuildMember.', () => {
      ClientEventHandlers.handleCommandExecute(command, interaction);
      expect(logger.info).toHaveBeenCalledWith('User Author issued command Command in Guild.');
    });

    it('should log execution with user displayName if author is User.', () => {
      ClientEventHandlers.handleCommandExecute(command, { ...interaction, member: null } as ChatInputCommandInteraction);
      expect(logger.info).toHaveBeenCalledWith('User Author issued command Command in Guild.');
    });

    it('should log execution with unknown guild name if no guild exists in interaction.', () => {
      ClientEventHandlers.handleCommandExecute(command, { ...interaction, guild: null } as ChatInputCommandInteraction);
      expect(logger.info).toHaveBeenCalledWith('User Author issued command Command in Unknown Guild or DM.');
    });
  });

  describe('ClientEventHandlers.handleCommandError()', () => {
    const error = new Error('Oops!');
    const command = { name: 'Command' } as Command;
    const interaction = {
      id: '123',
      guild: { name: 'Guild' } as Guild
    } as ChatInputCommandInteraction;

    it('should be defined.', () => {
      expect(ClientEventHandlers.handleCommandError).toBeDefined();
    });

    it('should log error.', () => {
      ClientEventHandlers.handleCommandError(error, command, interaction);
      expect(logger.error).toHaveBeenCalledWith(error);
    });

    it('should log error with guild name.', () => {
      ClientEventHandlers.handleCommandError(error, command, interaction);
      expect(logger.error).toHaveBeenCalledWith('Something happened when executing Command in Guild.');
    });

    it('should log error with unknown guild name if no guild exists in interaction.', () => {
      ClientEventHandlers.handleCommandError(error, command, { ...interaction, guild: null } as ChatInputCommandInteraction);
      expect(logger.error).toHaveBeenCalledWith('Something happened when executing Command in Unknown Guild or DM.');
    });

    it('should log error with interaction ID.', () => {
      ClientEventHandlers.handleCommandError(error, command, interaction);
      expect(logger.error).toHaveBeenCalledWith('Command interaction has an ID of 123.');
    });
  });

  describe('ClientEventHandlers.handleCommandRegistered()', () => {
    const command = { name: 'Command' } as Command;

    it('should be defined.', () => {
      expect(ClientEventHandlers.handleCommandRegistered).toBeDefined();
    });

    it('should log command registration.', () => {
      ClientEventHandlers.handleCommandRegistered(command);
      expect(logger.info).toHaveBeenCalledWith('Registered command: Command.');
    });
  });
});
