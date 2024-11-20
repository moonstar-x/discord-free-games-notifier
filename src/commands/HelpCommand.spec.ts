import HelpCommand from './HelpCommand';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtendedClient } from '../base/client/ExtendedClient';
import { BOT_ISSUES_URL, BOT_WEBSITE_URL, CRAWLER_ISSUES_URL, MESSAGE_EMBED_COLOR, MESSAGE_EMBED_THUMBNAIL } from '../config/constants';

describe('Commands > HelpCommand', () => {
  const client = {} as unknown as ExtendedClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(HelpCommand).toBeDefined();
  });

  describe('constructor', () => {
    it('should set the appropriate values.', () => {
      const command = new HelpCommand(client);
      expect(command.name).toBe('help');
    });
  });

  describe('run()', () => {
    const command = new HelpCommand(client);
    const interaction = {
      reply: jest.fn(),
      locale: 'en-US'
    } as unknown as ChatInputCommandInteraction;

    it('should reply with the embed.', async () => {
      await command.run(interaction);

      const expectedEmbeds = [
        new EmbedBuilder()
          .setTitle('Free Games Notifier')
          .setColor(MESSAGE_EMBED_COLOR)
          .setThumbnail(MESSAGE_EMBED_THUMBNAIL)
          .setFields(
            { name: 'Basic Information', value: 'This bot will send messages whenever a game becomes free on various game storefronts. To use this, make sure to run the **/configure channel** command to set the subscribed channel to send the notifications to. You may also choose which storefronts to get notified for.', inline: false },
            { name: 'Found a bug?', value: "If you found something broken, have feature requests or suggestions, don't hesitate to report them in the GitHub repo.", inline: false }
          )
      ];

      const expectedComponents = [
        new ActionRowBuilder<ButtonBuilder>()
          .setComponents(
            new ButtonBuilder().setEmoji('🐛').setStyle(ButtonStyle.Link).setURL(BOT_ISSUES_URL).setLabel('Found a bug with the bot?'),
            new ButtonBuilder().setEmoji('🐛').setStyle(ButtonStyle.Link).setURL(CRAWLER_ISSUES_URL).setLabel('Found a bug with game offer notifications?'),
          ),
        new ActionRowBuilder<ButtonBuilder>()
          .setComponents(
            new ButtonBuilder().setEmoji('🌎').setStyle(ButtonStyle.Link).setURL(BOT_WEBSITE_URL).setLabel('Official Website'),
          )
      ];

      expect(interaction.reply).toHaveBeenCalledWith({ embeds: expectedEmbeds, components: expectedComponents });
    });
  });
});
