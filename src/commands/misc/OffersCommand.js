const { Command } = require('@greencoast/discord.js-extended');
const ProviderFactory = require('../../classes/providers/ProviderFactory');

class OffersCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'offers',
      description: 'Get the current offers on the supported storefronts.',
      emoji: ':moneybag:',
      group: 'misc',
      guildOnly: false
    });
  }

  prepareMessageForOffer(header, offers) {
    return offers.reduce((message, offer, i) => {
      return `${message}${i + 1}. ${offer.game} - available at: ${offer.url}\n`;
    }, `${header}\n\n`);
  }

  async handleAllProviders(message) {
    const providers = ProviderFactory.getAll();

    for (const provider of providers) {
      const offers = await provider.getOffers();

      if (!offers) {
        message.channel.send(`Something happened when looking for offers in ${provider.name}. Try again later.`);
        continue;
      }

      if (offers.length < 1) {
        continue;
      }

      message.channel.send(this.prepareMessageForOffer(`Here are the offers available currently for ${provider.name}:`, offers));
    }
  }

  async handleSingleProvider(message, providerName) {
    try {
      const provider = ProviderFactory.getInstance(providerName);
      const offers = await provider.getOffers();

      if (!offers) {
        return message.channel.send(`Something happened when looking for offers in ${provider.name}. Try again later.`);
      }

      if (offers.length < 1) {
        return message.channel.send(`There are no free games currently in ${provider.name}. :(`);
      }

      return message.channel.send(this.prepareMessageForOffer(`Here are the offers available currently for ${provider.name}:`, offers));
    } catch (error) {
      if (error instanceof TypeError) {
        const availableProviders = Object.values(ProviderFactory.providerNames).join(', ');
        return message.channel.send(`I don't know of any game storefront named ${providerName}. Try again with any of the following: **${availableProviders}**`);
      }

      throw error;
    }
  }

  run(message, [providerName]) {
    if (!providerName) {
      return this.handleAllProviders(message);
    }

    return this.handleSingleProvider(message, providerName);
  }
}

module.exports = OffersCommand;
