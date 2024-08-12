import { BaseInteraction, ChatInputCommandInteraction } from 'discord.js';

export const isChatInputCommand = (interaction: BaseInteraction): interaction is ChatInputCommandInteraction => {
  return interaction.isChatInputCommand();
};
