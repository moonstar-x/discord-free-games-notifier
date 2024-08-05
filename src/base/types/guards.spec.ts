import { isChatInputCommand } from './guards';
import { BaseInteraction } from 'discord.js';

describe('Base > Types > Guards', () => {
  describe('isChatInputCommand()', () => {
    const interaction = {
      isChatInputCommand: jest.fn().mockReturnValue(true)
    } as unknown as BaseInteraction;

    it('should be defined.', () => {
      expect(isChatInputCommand).toBeDefined();
    });

    it('should return interaction.isChatInputCommand.', () => {
      expect(isChatInputCommand(interaction)).toBe(true);
    });
  });
});
