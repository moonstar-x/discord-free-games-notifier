import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionResolvable, DMChannel, PermissionsBitField } from 'discord.js';
import { ExtendedClient } from '../client/ExtendedClient';

export interface CommandOptions {
  name: string
  description: string
  emoji?: string
  guildOnly: boolean
  permissions?: PermissionResolvable | null
  builder: SlashCommandBuilder
}

export abstract class Command {
  public readonly client: ExtendedClient;

  public readonly name: string;
  public readonly description: string;
  public readonly emoji: string;
  public readonly guildOnly: boolean;
  public readonly permissions: PermissionResolvable | null;
  public readonly builder: SlashCommandBuilder;

  protected constructor(client: ExtendedClient, options: CommandOptions) {
    this.client = client;

    this.name = options.name;
    this.description = options.description;
    this.emoji = options.emoji || ':robot:';
    this.guildOnly = options.guildOnly;
    this.permissions = options.permissions ?? null;
    this.builder = options.builder
      .setName(this.name)
      .setDescription(this.description);
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

  public hasPermission(interaction: ChatInputCommandInteraction): boolean | string {
    if (!this.permissions || !interaction.channel) {
      return true;
    }

    if (interaction.channel instanceof DMChannel || interaction.channel.partial) {
      return true;
    }

    const missingPermissions = interaction.channel.permissionsFor(interaction.user.id)?.missing(PermissionsBitField.resolve(this.permissions));
    if (!missingPermissions?.length) {
      return true;
    }

    return `The command ${this.name} requires you to have the permissions: ${missingPermissions.join(', ')}.`;
  }
}
