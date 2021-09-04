const channelMock = {
  name: 'channel',
  id: '123',
  viewable: true,
  send: jest.fn(() => Promise.resolve()),
  guild: {
    name: 'guild'
  }
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
  dataProvider: {
    set: jest.fn(),
    get: jest.fn(),
    clear: jest.fn()
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
  channelMock,
  channelStoreMock
};
