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
  embed: jest.fn()
};

module.exports = {
  guildMock,
  clientMock,
  messageMock,
  userMock,
  memberMock,
  commandGroupMock,
  commandMock
};
