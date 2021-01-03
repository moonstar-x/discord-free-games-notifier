const guildMock = {
  name: 'guild'
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
  updatePresence: jest.fn()
};

const userMock = {
  username: 'user'
};

const memberMock = {
  displayName: 'nickname'
};

const channelMock = {
  name: 'channel',
  id: '123'
};

const messageMock = {
  reply: jest.fn(),
  guild: guildMock,
  author: userMock,
  member: memberMock,
  embed: jest.fn(),
  say: jest.fn()
};

const channelStoreMock = {
  cache: [channelMock, channelMock]
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
