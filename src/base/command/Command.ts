import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '../client/ExtendedClient';

// TODO: Implement guildOnly
// TODO: Implement permissions.
export interface CommandOptions {
  name: string
  description: string
  emoji?: string
  builder: SlashCommandBuilder
}

export abstract class Command {
  public readonly client: ExtendedClient;

  public readonly name: string;
  public readonly description: string;
  public readonly emoji: string;
  public readonly builder: SlashCommandBuilder;

  protected constructor(client: ExtendedClient, options: CommandOptions) {
    this.client = client;

    this.name = options.name;
    this.description = options.description;
    this.emoji = options.emoji || ':robot:';
    this.builder = options.builder
      .setName(this.name)
      .setDescription(this.description);
  }

  public abstract run(interaction: ChatInputCommandInteraction): Promise<void> | void;

  public async onError(error: unknown, interaction: ChatInputCommandInteraction): Promise<void> {
    this.client.emit('commandError', error, this, interaction);

    const message = `An error has occurred when running the command ${this.name}`;

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: message });
      return;
    }

    await interaction.reply({ content: message });
  }
}
