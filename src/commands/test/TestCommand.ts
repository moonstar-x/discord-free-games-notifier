import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../base/command/Command';
import { ExtendedClient } from '../../base/client/ExtendedClient';

export default class TestCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'test',
      description: 'Test',
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels] as const,
      builder: new SlashCommandBuilder()
    });
  }

  public override async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Hi!' });
  }
}
