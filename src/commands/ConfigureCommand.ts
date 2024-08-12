import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { updateOrCreateGuildChannel } from '../features/gameOffers/functions/updateOrCreateGuildChannel';
import { GuildChatInputCommandInteraction } from '../base/types/aliases';
import { getStorefronts } from '../features/gameOffers/functions/getStorefronts';
import { setGuildGameOfferEnabled } from '../features/gameOffers/functions/setGuildGameOfferEnabled';
import { AVAILABLE_LOCALES, getInteractionTranslator, Locale, MESSAGE_KEY_TO_LOCALE, MessageKey, translateAll, translateDefault } from '../i18n/translate';
import { updateOrCreateGuildLocale } from '../features/gameOffers/functions/updateOrCreateGuildLocale';

export default class ConfigureCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'configure',
      builder: new SlashCommandBuilder()
        .setName(translateDefault('commands.configure.name'))
        .setNameLocalizations(translateAll('commands.configure.name'))
        .setDescription(translateDefault('commands.configure.description'))
        .setDescriptionLocalizations(translateAll('commands.configure.description'))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((input) => {
          return input
            .setName(translateDefault('commands.configure.sub.channel.name'))
            .setNameLocalizations(translateAll('commands.configure.sub.channel.name'))
            .setDescription(translateDefault('commands.configure.sub.channel.description'))
            .setDescriptionLocalizations(translateAll('commands.configure.sub.channel.description'))
            .addChannelOption((input) => {
              return input
                .setName(translateDefault('commands.configure.sub.channel.options.channel.name'))
                .setNameLocalizations(translateAll('commands.configure.sub.channel.options.channel.name'))
                .setDescription(translateDefault('commands.configure.sub.channel.options.channel.description'))
                .setDescriptionLocalizations(translateAll('commands.configure.sub.channel.options.channel.description'))
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true);
            });
        })
        .addSubcommand((input) => {
          return input
            .setName(translateDefault('commands.configure.sub.storefronts.name'))
            .setNameLocalizations(translateAll('commands.configure.sub.storefronts.name'))
            .setDescription(translateDefault('commands.configure.sub.storefronts.description'))
            .setDescriptionLocalizations(translateAll('commands.configure.sub.storefronts.description'));
        })
        .addSubcommand((input) => {
          return input
            .setName(translateDefault('commands.configure.sub.language.name'))
            .setNameLocalizations(translateAll('commands.configure.sub.language.name'))
            .setDescription(translateDefault('commands.configure.sub.language.description'))
            .setDescriptionLocalizations(translateAll('commands.configure.sub.language.description'))
            .addStringOption((input) => {
              return input
                .setName(translateDefault('commands.configure.sub.language.options.language.name'))
                .setNameLocalizations(translateAll('commands.configure.sub.language.options.language.name'))
                .setDescription(translateDefault('commands.configure.sub.language.options.language.description'))
                .setDescriptionLocalizations(translateAll('commands.configure.sub.language.options.language.description'))
                .setRequired(true)
                .setChoices(Object.entries(MESSAGE_KEY_TO_LOCALE).map(([key, locale]) => {
                  return {
                    name: translateDefault(key as MessageKey),
                    name_localizations: translateAll(key as MessageKey),
                    value: locale
                  };
                }));
            });
        })
    });
  }

  public override async run(interaction: GuildChatInputCommandInteraction): Promise<void> {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
      case 'channel':
        return this.runChannel(interaction);
      case 'storefronts':
        return this.runStorefronts(interaction);
      case 'language':
        return this.runLanguage(interaction);
      default:
        return this.runDefault(interaction);
    }
  }

  private async runChannel(interaction: GuildChatInputCommandInteraction): Promise<void> {
    const t = getInteractionTranslator(interaction);
    const channel = interaction.options.getChannel('channel');

    if (!channel) {
      await interaction.reply({ content: t('commands.configure.run.channel.pre_check.text') });
      return;
    }

    await updateOrCreateGuildChannel(interaction.guildId, channel.id);
    await interaction.reply({ content: t('commands.configure.run.channel.success.text', { channel: channel.toString() }) });
  }

  private async runStorefronts(interaction: GuildChatInputCommandInteraction): Promise<void> {
    const t = getInteractionTranslator(interaction);
    const storefronts = await getStorefronts();

    if (!storefronts.length) {
      await interaction.reply({ content: t('commands.configure.run.storefronts.empty.text') });
      return;
    }

    await interaction.reply({ content: t('commands.configure.run.storefronts.start.text') });

    const buttonIds = {
      enable: 'configure-storefronts-enable',
      disable: 'configure-storefronts-disable'
    };

    for (const storefront of storefronts) {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
          new ButtonBuilder()
            .setCustomId(buttonIds.enable)
            .setLabel(t('commands.configure.run.storefronts.buttons.enable.label'))
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✅'),
          new ButtonBuilder()
            .setCustomId(buttonIds.disable)
            .setLabel(t('commands.configure.run.storefronts.buttons.disable.label'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❌')
        );

      const followUpSent = await interaction.followUp({ content: t('commands.configure.run.storefronts.follow_up.question.text', { storefront }), components: [row] });
      const userResponse = await followUpSent.awaitMessageComponent({
        filter: (i) => {
          return i.user.id === interaction.user.id && Object.values(buttonIds).includes(i.customId);
        },
        time: 60_000
      });

      const shouldEnable = userResponse.customId === buttonIds.enable;
      await setGuildGameOfferEnabled(interaction.guildId, storefront, shouldEnable);

      await userResponse.update({
        content: shouldEnable ?
          t('commands.configure.run.storefronts.response.update.positive.text', { storefront }) :
          t('commands.configure.run.storefronts.response.update.negative.text', { storefront }),
        components: []
      });
    }
  }

  private async runLanguage(interaction: GuildChatInputCommandInteraction): Promise<void> {
    const t = getInteractionTranslator(interaction);
    const locale = interaction.options.getString('language') as Locale | null;

    if (!locale) {
      await interaction.reply({ content: t('commands.configure.run.language.pre_check.text') });
      return;
    }

    const language = t(AVAILABLE_LOCALES[locale]);
    await updateOrCreateGuildLocale(interaction.guildId, locale);

    await interaction.reply({ content: t('commands.configure.run.language.success.text', { language }) });
  }

  private async runDefault(interaction: ChatInputCommandInteraction): Promise<void> {
    const t = getInteractionTranslator(interaction);

    await interaction.reply({ content: t('commands.configure.run.default.response.text') });
  }
}
