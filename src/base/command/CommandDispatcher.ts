import { BaseInteraction } from 'discord.js';
import logger from '@moonstar-x/logger';
import { ExtendedClient } from '../client/ExtendedClient';
import { CommandRegistry } from './CommandRegistry';
import { isChatInputCommand } from '../types/guards';


export class CommandDispatcher {
  public readonly client: ExtendedClient;
  public readonly registry: CommandRegistry;

  public constructor(client: ExtendedClient, registry: CommandRegistry) {
    this.client = client;
    this.registry = registry;
  }

  public async handleInteraction(interaction: BaseInteraction): Promise<void> {
    if (!isChatInputCommand(interaction)) {
      return;
    }

    const command = this.registry.get(interaction.commandName);
    if (!command) {
      return;
    }

    if (command.guildOnly && !interaction.inGuild()) {
      await interaction.reply({ content: 'I can only run this from a server.' });
      return;
    }

    try {
      const hasPermission = command.hasPermission(interaction);
      if (typeof hasPermission === 'string') {
        await interaction.reply({ content: hasPermission });
        return;
      }

      this.client.emit('commandExecute', command, interaction);
      await command.run(interaction);
    } catch (error) {
      try {
        await command.onError(error, interaction);
      } catch (handleError) {
        logger.error(`There was an error in the command execution for ${command.name}.`, error);
        logger.error(`Additionally, the error handling could not complete.`, handleError);
      }
    }
  }
}
