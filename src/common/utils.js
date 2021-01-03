const parseChannelMention = (channelStore, channelMention) => {
  const channelID = channelMention.replace(/[^0-9]+/gi, '');
  return channelStore.cache.find((channel) => channel.id === channelID);
};

module.exports = {
  parseChannelMention
};
