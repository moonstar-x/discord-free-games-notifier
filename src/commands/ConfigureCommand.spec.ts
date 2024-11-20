import ConfigureCommand from './ConfigureCommand';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { GuildChatInputCommandInteraction } from '../base/types/aliases';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { updateOrCreateGuildChannel } from '../features/gameOffers/functions/updateOrCreateGuildChannel';
import { getStorefronts } from '../features/gameOffers/functions/getStorefronts';
import { setGuildGameOfferEnabled } from '../features/gameOffers/functions/setGuildGameOfferEnabled';
import { updateOrCreateGuildLocale } from '../features/gameOffers/functions/updateOrCreateGuildLocale';

jest.mock('../features/gameOffers/functions/updateOrCreateGuildChannel', () => {
  return {
    updateOrCreateGuildChannel: jest.fn().mockImplementation(() => Promise.resolve())
  };
});

jest.mock('../features/gameOffers/functions/getStorefronts', () => {
  return {
    getStorefronts: jest.fn().mockResolvedValue(['EpicGames', 'Steam'])
  };
});

jest.mock('../features/gameOffers/functions/setGuildGameOfferEnabled', () => {
  return {
    setGuildGameOfferEnabled: jest.fn().mockImplementation(() => Promise.resolve())
  };
});

jest.mock('../features/gameOffers/functions/updateOrCreateGuildLocale', () => {
  return {
    updateOrCreateGuildLocale: jest.fn().mockImplementation(() => Promise.resolve())
  };
});

describe('Commands > ConfigureCommand', () => {
  const client = {} as ExtendedClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(ConfigureCommand).toBeDefined();
  });

  describe('constructor', () => {
    it('should set the appropriate values.', () => {
      const command = new ConfigureCommand(client);
      expect(command.name).toBe('configure');
    });
  });

  describe('run()', () => {
    const command = new ConfigureCommand(client);

    describe('runChannel()', () => {
      const interaction = {
        reply: jest.fn(),
        locale: 'en-US',
        guildId: '1267881983548063785',
        options: {
          getSubcommand: jest.fn().mockReturnValue('channel'),
          getChannel: jest.fn().mockReturnValue({ id: 'channel', toString: () => 'Channel' })
        }
      } as unknown as GuildChatInputCommandInteraction;

      it('should reply with pre check message if no channel is provided.', async () => {
        (interaction.options.getChannel as jest.Mock).mockReturnValueOnce(null);
        await command.run(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({ content: 'No channel provided.' });
      });

      it('should update guild channel.', async () => {
        await command.run(interaction);
        expect(updateOrCreateGuildChannel).toHaveBeenCalledWith(interaction.guildId, 'channel');
      });

      it('should reply with channel update message.', async () => {
        await command.run(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({ content: 'Successfully updated notifications channel to Channel.' });
      });
    });

    describe('runStorefronts()', () => {
      const userResponseMock = {
        customId: 'configure-storefronts-enable',
        update: jest.fn().mockImplementation(() => Promise.resolve())
      };
      const followUpResponseMock = {
        awaitMessageComponent: jest.fn().mockImplementation(({ filter }) => {
          filter({ user: { id: 1 }, customId: 'configure-storefronts-enable' });
          return userResponseMock;
        })
      };
      const interaction = {
        reply: jest.fn(),
        followUp: jest.fn().mockResolvedValue(followUpResponseMock),
        locale: 'en-US',
        guildId: '1267881983548063785',
        options: {
          getSubcommand: jest.fn().mockReturnValue('storefronts')
        },
        user: {
          id: 1
        }
      } as unknown as GuildChatInputCommandInteraction;

      it('should reply with empty storefronts message if no storefronts exist.', async () => {
        (getStorefronts as jest.Mock).mockResolvedValueOnce([]);
        await command.run(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({ content: 'No storefronts are available right now.' });
      });

      it('should reply with start message.', async () => {
        await command.run(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({ content: 'You will receive a follow up for each storefront available. Please, click on the buttons as they appear to enable or disable notifications for each storefront.' });
      });

      it('should send follow up with correct components for each storefront.', async () => {
        const expectedComponents = [
          new ActionRowBuilder<ButtonBuilder>()
            .setComponents(
              new ButtonBuilder()
                .setCustomId('configure-storefronts-enable')
                .setLabel('Enable')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✅'),
              new ButtonBuilder()
                .setCustomId('configure-storefronts-disable')
                .setLabel('Disable')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('❌')
            )
        ];

        await command.run(interaction);

        expect(interaction.followUp).toHaveBeenCalledWith({ components: expectedComponents, content: 'Would you like to receive notifications for **EpicGames**?' });
        expect(interaction.followUp).toHaveBeenCalledWith({ components: expectedComponents, content: 'Would you like to receive notifications for **Steam**?' });
      });

      it('should set the guild offer enabled from user response if enabled clicked.', async () => {
        userResponseMock.customId = 'configure-storefronts-enable';
        await command.run(interaction);

        expect(setGuildGameOfferEnabled).toHaveBeenCalledWith(interaction.guildId, 'EpicGames', true);
        expect(setGuildGameOfferEnabled).toHaveBeenCalledWith(interaction.guildId, 'Steam', true);
      });

      it('should set the guild offer enabled from user response if disabled clicked.', async () => {
        userResponseMock.customId = 'configure-storefronts-disable';
        await command.run(interaction);

        expect(setGuildGameOfferEnabled).toHaveBeenCalledWith(interaction.guildId, 'EpicGames', false);
        expect(setGuildGameOfferEnabled).toHaveBeenCalledWith(interaction.guildId, 'Steam', false);
      });

      it('should update the response with correct message if enabled clicked.', async () => {
        userResponseMock.customId = 'configure-storefronts-enable';
        await command.run(interaction);

        expect(userResponseMock.update).toHaveBeenCalledWith({ components: [], content: 'This server will receive notifications for **EpicGames**.' });
        expect(userResponseMock.update).toHaveBeenCalledWith({ components: [], content: 'This server will receive notifications for **Steam**.' });
      });

      it('should update the response with correct message if disabled clicked.', async () => {
        userResponseMock.customId = 'configure-storefronts-disable';
        await command.run(interaction);

        expect(userResponseMock.update).toHaveBeenCalledWith({ components: [], content: 'This server will no longer receive notifications for **EpicGames**.' });
        expect(userResponseMock.update).toHaveBeenCalledWith({ components: [], content: 'This server will no longer receive notifications for **Steam**.' });
      });
    });

    describe('runLanguage()', () => {
      const interaction = {
        reply: jest.fn(),
        locale: 'en-US',
        guildId: '1267881983548063785',
        options: {
          getSubcommand: jest.fn().mockReturnValue('language'),
          getString: jest.fn().mockReturnValue('en-US')
        }
      } as unknown as GuildChatInputCommandInteraction;

      it('should reply with pre check message if no locale is provided.', async () => {
        (interaction.options.getString as jest.Mock).mockReturnValueOnce(null);
        await command.run(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({ content: 'No language provided.' });
      });

      it('should update guild locale.', async () => {
        await command.run(interaction);
        expect(updateOrCreateGuildLocale).toHaveBeenCalledWith(interaction.guildId, 'en-US');
      });

      it('should reply with language update message.', async () => {
        await command.run(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({ content: 'Successfully updated notifications language to **English**.' });
      });
    });

    describe('runDefault()', () => {
      const interaction = {
        reply: jest.fn(),
        locale: 'en-US',
        guildId: '1267881983548063785',
        options: {
          getSubcommand: jest.fn().mockReturnValue('unknown')
        }
      } as unknown as GuildChatInputCommandInteraction;

      it('should reply with unknown subcommand message.', async () => {
        await command.run(interaction);
        expect(interaction.reply).toHaveBeenCalledWith({ content: 'Unknown subcommand received.' });
      });
    });
  });
});
