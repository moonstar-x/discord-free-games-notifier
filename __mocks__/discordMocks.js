const channelMock = {
  name: 'channel',
  id: '123',
  viewable: true
};

const channelStoreMock = {
  cache: [channelMock, channelMock]
};

const guildMock = {
  name: 'guild',
  channels: channelStoreMock
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
  provider: {
    set: jest.fn(),
    get: jest.fn()
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
  embed: jest.fn(),
  say: jest.fn()
};

module.exports = {
  guildMock,
  clientMock,
  messageMock,
  userMock,
  memberMock,
  commandGroupMock,
  commandMock,
  channelMock,
  channelStoreMock
};
