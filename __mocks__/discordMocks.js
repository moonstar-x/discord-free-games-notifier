const { Collection } = require('discord.js');

const channelMock = {
  name: 'channel',
  id: '123',
  viewable: true,
  send: jest.fn(() => Promise.resolve()),
  guild: {
    name: 'guild'
  }
};

const guildMock = {
  name: 'guild',
  id: '123',
  channels: {
    cache: new Collection([[channelMock.id, channelMock], [channelMock.id, channelMock]])
  }
};

const commandMock = {
  name: 'command',
  description: 'description'
};

const commandGroupMock = {
  name: 'group',
  commands: [commandMock, commandMock]
};

const clientMock = {
  handleCommandError: jest.fn(),
  registry: {
    groups: [commandGroupMock, commandGroupMock]
  },
  setProvider: jest.fn(() => Promise.resolve()),
  updatePresence: jest.fn(),
  dataProvider: {
    set: jest.fn(),
    get: jest.fn(),
    clear: jest.fn(),
    getGlobal: jest.fn(),
    setGlobal: jest.fn(),
    clearGlobal: jest.fn()
  },
  guilds: {
    cache: new Collection([[guildMock.id, guildMock], [guildMock.id, guildMock]])
  }
};

const userMock = {
  username: 'user'
};

const memberMock = {
  displayName: 'nickname'
};

const messageMock = {
  reply: jest.fn(),
  guild: guildMock,
  author: userMock,
  member: memberMock,
  channel: {
    send: jest.fn()
  },
  mentions: {
    channels: {
      first: jest.fn(() => channelMock)
    }
  }
};

module.exports = {
  guildMock,
  clientMock,
  messageMock,
  userMock,
  memberMock,
  commandGroupMock,
  commandMock,
  channelMock
};
