import { BaseInteraction } from 'discord.js';
import logger from '@moonstar-x/logger';
import { ExtendedClient } from '../client/ExtendedClient';
import { CommandRegistry } from './CommandRegistry';
import { isChatInputCommand } from '../types/guards';


export class InteractionDispatcher {
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

    try {
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
