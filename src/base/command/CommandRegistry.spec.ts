import { CommandRegistry } from './CommandRegistry';
import { ExtendedClient } from '../client/ExtendedClient';
import { Command } from './Command';
import { CommandRegistryError, CommandValidationError } from '../error/command';
import requireAll from 'require-all';

jest.mock('require-all');

describe('Base > Command > CommandRegistry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('class CommandRegistry', () => {
    let registry: CommandRegistry;

    const client = {
      emit: jest.fn()
    } as unknown as ExtendedClient;

    const command = {
      name: 'command',
      builder: {
        name: 'command',
        description: 'A little description.'
      }
    } as Command;
    const command2 = {
      name: 'cmd',
      builder: {
        name: 'cmd',
        description: 'A little description.'
      }
    } as Command;

    beforeEach(() => {
      registry = new CommandRegistry(client);
    });

    it('should be defined.', () => {
      expect(CommandRegistry).toBeDefined();
    });

    describe('register()', () => {
      it('should throw CommandValidationError if command is not valid.', () => {
        expect(() => registry.register({ ...command, name: '' } as Command)).toThrowError(CommandValidationError);
      });

      it('should throw CommandRegistryError if command is already registered.', () => {
        const expectedError = new CommandRegistryError('Command command is already registered. Command names must be unique.');
        registry.register(command);

        expect(() => registry.register(command)).toThrowError(expectedError);
      });

      it('should set the command.', () => {
        registry.register(command);
        expect(registry.get('command')).toBe(command);
      });

      it('should emit client.commandRegistered event.', () => {
        registry.register(command);
        expect(client.emit).toHaveBeenCalledWith('commandRegistered', command);
      });

      it('should set multiple commands if array provided.', () => {
        registry.register([command, command2]);
        expect(registry.get('command')).toBe(command);
        expect(registry.get('cmd')).toBe(command2);
      });
    });

    describe('get()', () => {
      beforeEach(() => {
        registry.register(command);
      });

      it('should return command if exists.', () => {
        expect(registry.get('command')).toBe(command);
      });

      it('should return undefined if command does not exist.', () => {
        expect(registry.get('unknown')).toBeUndefined();
      });
    });

    describe('getAll()', () => {
      beforeEach(() => {
        registry.register([command, command2]);
      });

      it('should return an array of commands.', () => {
        expect(registry.getAll()).toStrictEqual([command, command2]);
      });
    });

    describe('size()', () => {
      it('should return the number of commands registered.', () => {
        expect(registry.size()).toBe(0);
        registry.register(command);
        expect(registry.size()).toBe(1);
        registry.register(command2);
        expect(registry.size()).toBe(2);
      });
    });

    describe('registerIn()', () => {
      beforeAll(() => {
        (requireAll as jest.Mock).mockReturnValue({
          folder: {
            'file.ts': {
              default: jest.fn().mockReturnValue(command)
            }
          },
          folder2: {
            folder3: {
              folder4: {
                folder5: {
                  'file.ts': {
                    NamedExport: jest.fn().mockReturnValue(command2)
                  }
                }
              }
            }
          }
        });
      });

      afterAll(() => {
        (requireAll as jest.Mock).mockReset();
      });

      it('should register commands found.', () => {
        registry.registerIn('directory');

        expect(registry.get('command')).toBe(command);
        expect(registry.get('cmd')).toBe(command2);
      });
    });
  });
});
