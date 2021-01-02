const guildMock = {
  name: 'guild'
};

const clientMock = {
  handleCommandError: jest.fn()
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
  member: memberMock
};

module.exports = {
  guildMock,
  clientMock,
  messageMock,
  userMock,
  memberMock
};
