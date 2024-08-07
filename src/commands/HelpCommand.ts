import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getInteractionTranslator, translateAll, translateDefault } from '../i18n/translate';
import { BOT_ISSUES_URL, BOT_WEBSITE_URL, CRAWLER_ISSUES_URL, MESSAGE_EMBED_COLOR, MESSAGE_EMBED_THUMBNAIL } from '../config/constants';

export default class HelpCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'help',
      builder: new SlashCommandBuilder()
        .setName(translateDefault('commands.help.name'))
        .setNameLocalizations(translateAll('commands.help.name'))
        .setDescription(translateDefault('commands.help.description'))
        .setDescriptionLocalizations(translateAll('commands.help.description'))
    });
  }

  public override async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const t = getInteractionTranslator(interaction);

    const embed = new EmbedBuilder()
      .setTitle(t('commands.help.run.embed.title'))
      .setColor(MESSAGE_EMBED_COLOR)
      .setThumbnail(MESSAGE_EMBED_THUMBNAIL)
      .setFields(
        { name: t('commands.help.run.embed.fields.0.name'), value: t('commands.help.run.embed.fields.0.value'), inline: false },
        { name: t('commands.help.run.embed.fields.1.name'), value: t('commands.help.run.embed.fields.1.value'), inline: false }
      );

    const row1 = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder().setEmoji('🐛').setStyle(ButtonStyle.Link).setURL(BOT_ISSUES_URL).setLabel(t('commands.help.run.buttons.bot_issues.label')),
        new ButtonBuilder().setEmoji('🐛').setStyle(ButtonStyle.Link).setURL(CRAWLER_ISSUES_URL).setLabel(t('commands.help.run.buttons.crawler_issues.label')),
      );

    const row2 = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder().setEmoji('🌎').setStyle(ButtonStyle.Link).setURL(BOT_WEBSITE_URL).setLabel(t('commands.help.run.buttons.bot_website.label')),
      );

    await interaction.reply({ embeds: [embed], components: [row1, row2] });
  }
}
