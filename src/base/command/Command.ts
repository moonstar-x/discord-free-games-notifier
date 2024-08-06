import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { ExtendedClient } from '../client/ExtendedClient';
import { getInteractionTranslator } from '../../i18n/translate';

export type AnySlashCommandBuilder = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;

export interface CommandOptions {
  name: string
  builder: AnySlashCommandBuilder
}

export abstract class Command {
  public readonly client: ExtendedClient;

  public readonly name: string;
  public readonly builder: AnySlashCommandBuilder;

  protected constructor(client: ExtendedClient, options: CommandOptions) {
    this.client = client;

    this.name = options.name;
    this.builder = options.builder;
  }

  public abstract run(interaction: ChatInputCommandInteraction): Promise<void> | void;

  public async onError(error: unknown, interaction: ChatInputCommandInteraction): Promise<void> {
    this.client.emit('commandError', error, this, interaction);

    const t = getInteractionTranslator(interaction);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: t('base.command.error.message', { name: this.name }) });
      return;
    }

    await interaction.reply({ content: t('base.command.error.message', { name: this.name }) });
  }
}
