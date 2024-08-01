import { validateCommand } from './validators';
import { Command } from './Command';
import { CommandValidationError } from '../error/command';

describe('Base > Command > Validators', () => {
  describe('validateCommand()', () => {
    const command = {
      name: 'command',
      description: 'A little description.'
    } as Command;

    it('should be defined.', () => {
      expect(validateCommand).toBeDefined();
    });

    it('should throw CommandValidationError if name is too short.', () => {
      const expectedError = new CommandValidationError('Command / has an invalid name. It must be between 1 and 32 characters.');
      expect(() => validateCommand({ ...command, name: '' } as Command)).toThrow(expectedError);
    });

    it('should throw CommandValidationError if name is too long.', () => {
      const name = 'a'.repeat(35);
      const expectedError = new CommandValidationError(`Command /${name} has an invalid name. It must be between 1 and 32 characters.`);
      expect(() => validateCommand({ ...command, name } as Command)).toThrow(expectedError);
    });

    it('should throw CommandValidationError if name contains upper case letters.', () => {
      const name = 'COmmand';
      const expectedError = new CommandValidationError(`Command /${name} has an invalid name. Please use all lower-cased characters.`);
      expect(() => validateCommand({ ...command, name } as Command)).toThrow(expectedError);
    });

    it('should throw CommandValidationError if description is too short.', () => {
      const expectedError = new CommandValidationError('Command /command has an invalid description. It must be between 1 and 100 characters.');
      expect(() => validateCommand({ ...command, description: '' } as Command)).toThrow(expectedError);
    });

    it('should throw CommandValidationError if description is too long.', () => {
      const description = 'a'.repeat(101);
      const expectedError = new CommandValidationError('Command /command has an invalid description. It must be between 1 and 100 characters.');
      expect(() => validateCommand({ ...command, description } as Command)).toThrow(expectedError);
    });
  });
});
