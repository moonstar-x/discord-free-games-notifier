import logger from '@moonstar-x/logger';
import { ExtendedClient } from '../../../base/client/ExtendedClient';
import { GameOffer, NotifiableGuild, offerToMessage } from '../../../models/gameOffer';
import { subscribeToOffers, UnsubscribeFunction } from '../pubsub/subscribeToOffers';
import { getNotifiableGuilds } from '../functions/getNotifiableGuilds';
import { ChannelType, Guild } from 'discord.js';
import { deleteGuild } from '../functions/deleteGuild';
import { getTranslator } from '../../../i18n/translate';

export class OffersNotifier {
  public readonly client: ExtendedClient;

  private subscription: UnsubscribeFunction | null;

  public constructor(client: ExtendedClient) {
    this.client = client;
    this.subscription = null;
  }

  public async subscribe(): Promise<void> {
    if (this.subscription) {
      await this.subscription();
    }

    this.subscription = await subscribeToOffers(this.handleOffer.bind(this));
  }

  private async handleOffer(offer: GameOffer): Promise<void> {
    logger.info(`Received new offer from Redis: ${offer.title} on ${offer.storefront}`);

    const notifiableGuilds = await getNotifiableGuilds(offer.storefront);

    await Promise.all(notifiableGuilds.map(async (notifiableGuild) => {
      const guild = await this.fetchGuild(notifiableGuild.guild);

      if (!guild) {
        return this.handleNoGuildFound(notifiableGuild.guild);
      }

      if (this.isGuildInThisShard(guild)) {
        return this.notifyGuild(notifiableGuild, guild, offer);
      }
    }));
  }

  private async handleNoGuildFound(guildId: string): Promise<void> {
    try {
      logger.warn(`Guild with id ${guildId} does not exist anymore. Maybe the bot is no longer in it? Will remove from the database.`);
      await deleteGuild(guildId);
      logger.info(`Deleted guild data for ${guildId}.`);
    } catch (error) {
      logger.error(`Could not delete guild data for ${guildId}.`);
      logger.error(error);
    }
  }

  private async notifyGuild(notifiableGuild: NotifiableGuild, guild: Guild, offer: GameOffer): Promise<void> {
    try {
      const channel = await guild.channels.fetch(notifiableGuild.channel);
      const t = getTranslator(notifiableGuild.locale);

      if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
        return;
      }

      const { component, embed } = offerToMessage(offer, t);
      await channel.send({ embeds: [embed], components: [component] });
    } catch (error) {
      logger.error(`Could not notify guild ${guild.name} about offer ${offer.title} on ${offer.storefront}.`);
      logger.error(error);
    }
  }

  private async fetchGuild(guildId: string): Promise<Guild | null> {
    try {
      return await this.client.guilds.fetch(guildId);
    } catch (error) {
      return null;
    }
  }

  private isGuildInThisShard(guild: Guild): boolean {
    if (!this.client.shard) {
      return true;
    }

    return this.client.shard.ids.some((id) => id === guild.shardId);
  }
}
