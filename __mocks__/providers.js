const offerMock = {
  game: 'name',
  provider: 'provider',
  url: 'url',
  id: 'id'
};

const providerMock = {
  getOffers: jest.fn(() => Promise.resolve([offerMock]))
};

const factoryMock = {
  getAll: jest.fn(() => [providerMock, providerMock]),
  getInstance: jest.fn((name) => {
    if (name === 'valid') {
      return providerMock;
    }
    throw new TypeError('Invalid provider');
  })
};

module.exports = {
  offerMock,
  providerMock,
  factoryMock
};
