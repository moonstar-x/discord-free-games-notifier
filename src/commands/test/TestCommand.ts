import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../base/command/Command';
import { ExtendedClient } from '../../base/client/ExtendedClient';
import { getCurrentGameOffers } from '../../features/gameOffers/functions/getCurrentGameOffers';

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
    const result = await getCurrentGameOffers();
    await interaction.reply({ content: `
    \`\`\`
${JSON.stringify(result, null, 2)}
    \`\`\`
    ` });
  }
}
