import { ExtendedClient } from '../client/ExtendedClient';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import humanizeDuration from 'humanize-duration';
import { Collection, Guild, Snowflake } from 'discord.js';
import { randomItem } from '../../utils/array';

dayjs.extend(utc);
dayjs.extend(timezone);

const PRESENCE_NAMES = ['n_guilds', 'n_members', 'n_commands', 'time_cur', 'time_ready', 'uptime'] as const;
type PresenceName = typeof PRESENCE_NAMES[number];

export class PresenceResolver {
  public readonly client: ExtendedClient;

  public constructor(client: ExtendedClient) {
    this.client = client;
  }

  public async get(name: PresenceName): Promise<string> {
    const value = await this.getValue(name);

    switch (name) {
      case 'n_guilds':
        return `in ${value} servers!`;
      case 'n_members':
        return `with ${value} users!`;
      case 'n_commands':
        return `with ${value} commands!`;
      case 'time_cur':
        return `Current time: ${value}`;
      case 'time_ready':
        return `Up since: ${value}`;
      case 'uptime':
        return `Up for: ${value}`;
      default:
        throw new Error('Invalid presence name provided.');
    }
  }

  public getRandom(): Promise<string> {
    return this.get(randomItem(PRESENCE_NAMES));
  }

  private getValue(name: PresenceName): Promise<string> {
    switch (name) {
      case 'n_guilds':
        return this.getNumberOfGuilds();
      case 'n_members':
        return this.getNumberOfMembers();
      case 'n_commands':
        return this.getNumberOfCommands();
      case 'time_cur':
        return this.getCurrentTime();
      case 'time_ready':
        return this.getReadyTime();
      case 'uptime':
        return this.getUptime();
      default:
        throw new Error('Invalid presence name provided.');
    }
  }

  private async getNumberOfGuilds(): Promise<string> {
    if (!this.client.shard) {
      return this.client.guilds.cache.size.toString();
    }

    const results = await this.client.shard.fetchClientValues('guilds.cache.size');
    return (results as number[]).reduce((sum, size) => sum + size, 0).toString();
  }

  private async getNumberOfMembers(): Promise<string> {
    if (!this.client.shard) {
      return this.client.guilds.cache.reduce((sum, guild) => sum + guild.memberCount, 0).toString();
    }

    const results = await this.client.shard.fetchClientValues('guilds.cache');
    return (results as Collection<Snowflake, Guild>[]).reduce((sum, cache) => {
      const members = cache.reduce((sum: number, guild: Guild) => sum + guild.memberCount, 0);
      return sum + members;
    }, 0).toString();
  }

  private async getNumberOfCommands(): Promise<string> {
    return this.client.registry.size().toString();
  }

  private async getCurrentTime(): Promise<string> {
    const now = new Date().getTime();
    return dayjs(now).tz().format('hh:mm:ss A');
  }

  private async getReadyTime(): Promise<string> {
    const readyTimestamp = this.client.readyTimestamp ?? new Date().getTime();
    return dayjs(readyTimestamp).tz().format('ddd, DD/MM/YY @hh:mm:ss A');
  }

  private async getUptime(): Promise<string> {
    const uptime = this.client.uptime || 0;

    return humanizeDuration(uptime, {
      largest: 3,
      units: ['d', 'h', 'm'],
      round: true,
      conjunction: ' and ',
      serialComma: false
    });
  }
}
