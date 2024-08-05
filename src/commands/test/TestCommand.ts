import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../base/command/Command';
import { ExtendedClient } from '../../base/client/ExtendedClient';
import { deleteGuild } from '../../features/gameOffers/functions/deleteGuild';

export default class TestCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'test',
      builder: new SlashCommandBuilder()
        .addChannelOption((input) => {
          return input
            .setName('channel')
            .setDescription('The channel to use.')
            .setRequired(true);
        })
    });
  }

  public override async run(interaction: ChatInputCommandInteraction<'raw' | 'cached'>): Promise<void> {
    const result = await deleteGuild(interaction.guildId);

    await interaction.reply({ content: `
    \`\`\`
${JSON.stringify(result, null, 2)}
    \`\`\`
    ` });
  }
}
