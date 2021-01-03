const ExtendedCommand = require('../../classes/extensions/ExtendedCommand');
const ProviderFactory = require('../../classes/providers/ProviderFactory');

class OffersCommand extends ExtendedCommand {
  constructor(client) {
    super(client, {
      name: 'offers',
      emoji: ':moneybag:',
      memberName: 'offers',
      group: 'misc',
      description: 'Get the current offers on the supported store fronts.',
      examples: [`${client.commandPrefix}offers`, `${client.commandPrefix}offers <provider>`],
      guildOnly: false,
      argsType: 'multiple'
    });
  }

  prepareMessageForOffer(header, offers) {
    return offers.reduce((message, offer, i) => {
      return `${message}${i + 1}. ${offer.game} - available at: ${offer.url}\n`;
    }, `${header}\n\n`);
  }

  handleAllProviders(message) {
    const providers = ProviderFactory.getAll();

    return providers.map((provider) => {
      return provider.getOffers()
        .then((offers) => {
          if (!offers) {
            message.say(`Something happened when looking for offers in ${provider.name}. Try again later.`);
            return;
          }

          if (offers.length < 1) {
            return;
          }

          message.say(this.prepareMessageForOffer(`Here are the offers available currently for ${provider.name}:`, offers));
        });
    });
  }

  handleSingleProvider(message, providerName) {
    try {
      const provider = ProviderFactory.getInstance(providerName);
      return provider.getOffers()
        .then((offers) => {
          if (!offers) {
            message.say(`Something happened when looking for offers in ${provider.name}. Try again later.`);
            return;
          }

          if (offers.length < 1) {
            message.say(`There are no free games currently in ${provider.name}. :(`);
            return;
          }

          message.say(this.prepareMessageForOffer(`Here are the offers available currently for ${provider.name}:`, offers));
        });
    } catch (error) {
      if (error instanceof TypeError) {
        const availableProviders = Object.values(ProviderFactory.providerNames).join(', ');
        message.say(`I don't know of any game storefront named ${providerName}. Try again with any of the following: **${availableProviders}**`);
      } else {
        throw error;
      }
    }
  }

  run(message, [providerName]) {
    super.run(message);

    if (!providerName) {
      this.handleAllProviders(message);
      return;
    }

    this.handleSingleProvider(message, providerName);
  }
}

module.exports = OffersCommand;
