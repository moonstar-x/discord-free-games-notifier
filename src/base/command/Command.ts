import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { ExtendedClient } from '../client/ExtendedClient';

export interface CommandOptions {
  name: string
  builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
}

export abstract class Command {
  public readonly client: ExtendedClient;

  public readonly name: string;
  public readonly builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

  protected constructor(client: ExtendedClient, options: CommandOptions) {
    this.client = client;

    this.name = options.name;
    this.builder = options.builder;
  }

  public abstract run(interaction: ChatInputCommandInteraction): Promise<void> | void;

  public async onError(error: unknown, interaction: ChatInputCommandInteraction): Promise<void> {
    this.client.emit('commandError', error, this, interaction);

    const message = `An error has occurred when running the command ${this.name}.`;

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: message });
      return;
    }

    await interaction.reply({ content: message });
  }
}
