import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { Channel, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getGuild } from '../features/gameOffers/functions/getGuild';
import { GuildChatInputCommandInteraction } from '../base/types/aliases';
import { AVAILABLE_LOCALES, DEFAULT_LOCALE, getInteractionTranslator, translateAll, translateDefault } from '../i18n/translate';
import { MESSAGE_EMBED_COLOR } from '../config/constants';

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
    const t = getInteractionTranslator(interaction);
    const guildInfo = await getGuild(interaction.guildId);

    if (!guildInfo) {
      await interaction.reply({ content: t('commands.info.run.pre_check.text') });
      return;
    }

    const guild = await this.client.guilds.fetch(guildInfo.guild);
    const channel = await this.getChannel(guildInfo.channel);
    const localeKey = AVAILABLE_LOCALES[guildInfo.locale] ?? AVAILABLE_LOCALES[DEFAULT_LOCALE];

    const createdAt = new Date(guildInfo.created_at).toLocaleString(interaction.locale);
    const updatedAt = new Date(guildInfo.updated_at).toLocaleString(interaction.locale);

    const embed = new EmbedBuilder()
      .setTitle(t('commands.info.run.embed.title'))
      .setColor(MESSAGE_EMBED_COLOR)
      .setFields(
        { name: t('commands.info.run.embed.fields.server.name'), value: guild.name, inline: true },
        { name: t('commands.info.run.embed.fields.channel.name'), value: channel ? channel.toString() : t('commands.info.run.embed.fields.channel.value.unset'), inline: true },
        { name: t('commands.info.run.embed.fields.locale.name'), value: t(localeKey), inline: true },
        { name: t('commands.info.run.embed.fields.subscriptions.name'), value: t('commands.info.run.embed.fields.subscriptions.value'), inline: false },
        ...Object.entries(guildInfo.storefronts).map(([storefront, data]) => {
          return { name: storefront, value: data.enabled ? t('commands.info.run.embed.fields.storefronts.value.enabled') : t('commands.info.run.embed.fields.storefronts.value.disabled'), inline: true };
        })
      )
      .setFooter({
        text: t('commands.info.run.embed.footer', { createdAt, updatedAt })
      });

    await interaction.reply({ embeds: [embed] });
  }

  private async getChannel(channelId: string | null): Promise<Channel | null> {
    try {
      if (!channelId) {
        return null;
      }

      return await this.client.channels.fetch(channelId);
    } catch (error) {
      return null;
    }
  }
}
