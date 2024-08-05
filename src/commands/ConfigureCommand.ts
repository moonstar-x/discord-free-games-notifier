import { Command } from '../base/command/Command';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { updateOrCreateGuildChannel } from '../features/gameOffers/functions/updateOrCreateGuildChannel';
import { GuildChatInputCommandInteraction } from '../base/types/aliases';
import { getStorefronts } from '../features/gameOffers/functions/getStorefronts';
import { setGuildGameOfferEnabled } from '../features/gameOffers/functions/setGuildGameOfferEnabled';

export default class ConfigureCommand extends Command {
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'configure',
      builder: new SlashCommandBuilder()
        .setName('configure')
        .setNameLocalizations({
          'en-US': 'configure',
          'en-GB': 'configure',
          'es-ES': 'configurar',
          'es-419': 'configurar',
          fr: 'configurer'
        })
        .setDescription('Change the configuration for this server.')
        .setDescriptionLocalizations({
          'en-US': 'Change the configuration for this server.',
          'en-GB': 'Change the configuration for this server.',
          'es-ES': 'Cambia la configuración para este servidor.',
          'es-419': 'Cambia la configuración para este servidor.',
          fr: 'Changez la configuration pour ce serveur.'
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((input) => {
          return input
            .setName('channel')
            .setDescription('Set the notifications channel.')
            .addChannelOption((input) => {
              return input
                .setName('channel')
                .setDescription('The text channel to use.')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true);
            });
        })
        .addSubcommand((input) => {
          return input
            .setName('storefronts')
            .setDescription('Enable or disable notifications from specific Storefronts.');
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
      default:
        return this.runDefault(interaction);
    }
  }

  private async runChannel(interaction: GuildChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel');

    if (!channel) {
      await interaction.reply({ content: 'No channel received.' });
      return;
    }

    await updateOrCreateGuildChannel(interaction.guildId, channel.id);
    await interaction.reply({ content: `Updated notifications channel to ${channel}.` });
  }

  private async runStorefronts(interaction: GuildChatInputCommandInteraction): Promise<void> {
    const storefronts = await getStorefronts();

    if (!storefronts.length) {
      await interaction.reply({ content: 'No storefronts are available.' });
      return;
    }

    await interaction.reply({ content: 'Click on the enable or disable buttons for each Storefront to enable or disable it.' });

    for (const storefront of storefronts) {
      const enableButton = new ButtonBuilder()
        .setCustomId('storefronts-enable')
        .setLabel('Enable')
        .setStyle(ButtonStyle.Primary);

      const disableButton = new ButtonBuilder()
        .setCustomId('storefronts-disable')
        .setLabel('Disable')
        .setStyle(ButtonStyle.Secondary);

      const actionRow = new ActionRowBuilder()
        .addComponents(enableButton, disableButton);

      const response = await interaction.followUp({ content: `Enable or disable **${storefront}**?`, components: [actionRow] as any });
      const confirmation = await response.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith('storefronts'), time: 60_000 });

      const enabled = confirmation.customId === 'storefronts-enable';
      await setGuildGameOfferEnabled(interaction.guildId, storefront, enabled);

      await confirmation.update({ content: `Updated ${storefront} subscription.`, components: [] });
    }
  }

  private async runDefault(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Unknown subcommand received.' });
  }
}
