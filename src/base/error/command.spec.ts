import { CommandRegistryError, CommandValidationError } from './command';

describe('Base > Error > Command', () => {
  describe('class CommandRegistryError', () => {
    it('should be defined.', () => {
      expect(CommandRegistryError).toBeDefined();
    });

    it('should return an instance of Error.', () => {
      expect(new CommandRegistryError()).toBeInstanceOf(Error);
    });
  });

  describe('class CommandValidationError', () => {
    it('should be defined.', () => {
      expect(CommandValidationError).toBeDefined();
    });

    it('should return an instance of Error.', () => {
      expect(new CommandValidationError()).toBeInstanceOf(Error);
    });
  });
});
