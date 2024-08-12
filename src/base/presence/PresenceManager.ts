import { PresenceResolver } from './PresenceResolver';
import { ExtendedClient } from '../client/ExtendedClient';
import { ActivityType, PresenceStatusData } from 'discord.js';
import logger from '@moonstar-x/logger';

const MIN_INTERVAL_MS = 1000;

export interface PresenceManagerOptions {
  status?: PresenceStatusData
  type?: ActivityType
  afk?: boolean
}

export class PresenceManager {
  public readonly client: ExtendedClient;
  public readonly resolver: PresenceResolver;
  public readonly options: Required<PresenceManagerOptions>;

  private intervalHandle: NodeJS.Timeout | null;

  public constructor(client: ExtendedClient, resolver: PresenceResolver, options: PresenceManagerOptions = {}) {
    this.client = client;
    this.resolver = resolver;

    this.options = {
      status: options.status ?? 'online',
      type: options.type ?? ActivityType.Playing,
      afk: options.afk ?? false
    };
    this.intervalHandle = null;
  }

  public async setRefreshInterval(intervalMs: number | null): Promise<void> {
    if (!intervalMs) {
      this.clearInterval();
      return;
    }

    if (intervalMs < MIN_INTERVAL_MS) {
      throw new Error(`Interval should be greater than ${MIN_INTERVAL_MS}.`);
    }

    this.clearInterval();
    await this.update();
    this.intervalHandle = setInterval(() => this.update(), intervalMs);
  }

  public setPresence(presence: string): void {
    try {
      this.client.user?.setPresence({
        activities: [{
          name: presence,
          type: this.options.type
        }],
        status: this.options.status,
        afk: this.options.afk
      });

      logger.info(`Presence changed to: ${presence}`);
    } catch (error) {
      logger.error('Could not update client presence.');
      logger.error(error);
    }
  }

  public async update(): Promise<void> {
    const presence = await this.resolver.getRandom();
    this.setPresence(presence);
  }

  private clearInterval() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }

    this.intervalHandle = null;
  }
}
