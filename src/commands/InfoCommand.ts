import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getGuild } from '../features/gameOffers/functions/getGuild';
import { GuildChatInputCommandInteraction } from '../base/types/aliases';
import { translateAll, translateDefault } from '../i18n/translate';

export default class InfoCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'info',
      builder: new SlashCommandBuilder()
        .setName(translateDefault('commands.info.name'))
        .setNameLocalizations(translateAll('commands.info.name'))
        .setDescription(translateDefault('commands.info.description'))
        .setDescriptionLocalizations(translateAll('commands.info.description'))
        .setDMPermission(false)
    });
  }

  public override async run(interaction: GuildChatInputCommandInteraction): Promise<void> {
    const guildInfo = await getGuild(interaction.guildId);

    if (!guildInfo) {
      await interaction.reply({ content: 'No settings have been found for this server. Please use the /configure channel command.' });
      return;
    }

    const guild = await this.client.guilds.fetch(guildInfo.guild);
    const channel = guildInfo.channel ? await this.client.channels.fetch(guildInfo.channel) : null;

    const createdAt = new Date(guildInfo.created_at);
    const updatedAt = new Date(guildInfo.updated_at);

    const embed = new EmbedBuilder()
      .setTitle('Free Games Notifier Settings')
      .setFields(
        { name: 'Server', value: guild.name, inline: true } as any,
        { name: 'Subscription Channel', value: channel?.toString() ?? 'Unset', inline: true } as any,
        { name: 'Subscriptions', value: "Here's a list of all the storefronts subscriptions for this server.", inline: false } as any,
        ...Object.entries(guildInfo.storefronts).map(([storefront, enabled]) => {
          return { name: storefront, value: enabled ? 'Enabled' : 'Disabled', inline: true };
        }) as any
      )
      .setFooter({
        text: `Settings created @ ${createdAt.toLocaleString()}\nLast updated @ ${updatedAt.toLocaleString()}`
      });

    await interaction.reply({ embeds: [embed] });
  }
}
