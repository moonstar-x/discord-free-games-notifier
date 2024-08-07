import InfoCommand from './InfoCommand';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { GuildChatInputCommandInteraction } from '../base/types/aliases';
import { getGuild } from '../features/gameOffers/functions/getGuild';
import { EmbedBuilder } from 'discord.js';
import { MESSAGE_EMBED_COLOR } from '../config/constants';

jest.mock('../features/gameOffers/functions/getGuild', () => {
  return {
    getGuild: jest.fn()
  };
});

describe('Commands > InfoCommand', () => {
  const client = {
    guilds: {
      fetch: jest.fn().mockResolvedValue({ name: 'Guild' })
    },
    channels: {
      fetch: jest.fn().mockResolvedValue('Channel')
    }
  } as unknown as ExtendedClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(InfoCommand).toBeDefined();
  });

  describe('constructor', () => {
    it('should set the appropriate values.', () => {
      const command = new InfoCommand(client);
      expect(command.name).toBe('info');
    });
  });

  describe('run()', () => {
    const command = new InfoCommand(client);
    const interaction = {
      reply: jest.fn(),
      locale: 'en-US',
      guildId: '1267881983548063785'
    } as unknown as GuildChatInputCommandInteraction;

    beforeAll(() => {
      (getGuild as jest.Mock).mockResolvedValue({
        guild: '1267881983548063785',
        channel: '1267881984642908346',
        created_at: '2024-08-04T15:16:40.054841+00:00',
        updated_at: '2024-08-04T15:16:40.054841+00:00',
        storefronts: {
          EpicGames: {
            enabled: true
          },
          Steam: {
            enabled: false
          }
        }
      });
    });

    it('should reply with configure message if no settings are found.', async () => {
      (getGuild as jest.Mock).mockResolvedValueOnce(null);
      await command.run(interaction);

      expect(interaction.reply).toHaveBeenCalledWith({ content: 'No settings have been found for this server. Please use **/configure channel** command to set up the subscription channel.' });
    });

    it('should reply with the correct embed if channel exists.', async () => {
      await command.run(interaction);

      const expectedEmbeds = [
        new EmbedBuilder()
          .setTitle('Settings for Free Games Notifier')
          .setColor(MESSAGE_EMBED_COLOR)
          .setFields(
            { name: 'Server', value: 'Guild', inline: true },
            { name: 'Subscription Channel', value: 'Channel', inline: true },
            { name: 'Subscriptions', value: "Here's a list of all the storefronts this server is subscribed to.", inline: false },
            { name: 'EpicGames', value: '✅ Enabled', inline: true },
            { name: 'Steam', value: '❌ Disabled', inline: true }
          )
          .setFooter({
            text: 'Created: 8/4/2024, 10:16:40 AM\nLast modified: 8/4/2024, 10:16:40 AM'
          })
      ];

      expect(interaction.reply).toHaveBeenCalledWith({ embeds: expectedEmbeds });
    });

    it('should reply with the correct embed if no channel is set.', async () => {
      (getGuild as jest.Mock).mockResolvedValueOnce({
        guild: '1267881983548063785',
        channel: null,
        created_at: '2024-08-04T15:16:40.054841+00:00',
        updated_at: '2024-08-04T15:16:40.054841+00:00',
        storefronts: {
          EpicGames: {
            enabled: true
          },
          Steam: {
            enabled: false
          }
        }
      });
      await command.run(interaction);

      const expectedEmbeds = [
        new EmbedBuilder()
          .setTitle('Settings for Free Games Notifier')
          .setColor(MESSAGE_EMBED_COLOR)
          .setFields(
            { name: 'Server', value: 'Guild', inline: true },
            { name: 'Subscription Channel', value: 'Unset', inline: true },
            { name: 'Subscriptions', value: "Here's a list of all the storefronts this server is subscribed to.", inline: false },
            { name: 'EpicGames', value: '✅ Enabled', inline: true },
            { name: 'Steam', value: '❌ Disabled', inline: true }
          )
          .setFooter({
            text: 'Created: 8/4/2024, 10:16:40 AM\nLast modified: 8/4/2024, 10:16:40 AM'
          })
      ];

      expect(interaction.reply).toHaveBeenCalledWith({ embeds: expectedEmbeds });
    });

    it('should reply with the correct embed if channel set does not exist.', async () => {
      (client.channels.fetch as jest.Mock).mockResolvedValueOnce(null);
      await command.run(interaction);

      const expectedEmbeds = [
        new EmbedBuilder()
          .setTitle('Settings for Free Games Notifier')
          .setColor(MESSAGE_EMBED_COLOR)
          .setFields(
            { name: 'Server', value: 'Guild', inline: true },
            { name: 'Subscription Channel', value: 'Unset', inline: true },
            { name: 'Subscriptions', value: "Here's a list of all the storefronts this server is subscribed to.", inline: false },
            { name: 'EpicGames', value: '✅ Enabled', inline: true },
            { name: 'Steam', value: '❌ Disabled', inline: true }
          )
          .setFooter({
            text: 'Created: 8/4/2024, 10:16:40 AM\nLast modified: 8/4/2024, 10:16:40 AM'
          })
      ];

      expect(interaction.reply).toHaveBeenCalledWith({ embeds: expectedEmbeds });
    });
  });
});
