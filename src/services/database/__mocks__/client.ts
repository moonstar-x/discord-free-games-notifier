const txMock = {
  manyOrNone: jest.fn().mockImplementation(() => Promise.resolve([])),
  one: jest.fn().mockImplementation(() => Promise.resolve(null)),
  any: jest.fn().mockImplementation(() => Promise.resolve()),
  none: jest.fn().mockImplementation(() => Promise.resolve()),
  multi: jest.fn().mockImplementation(() => Promise.resolve())
};

export const db = {
  _txMock: txMock,
  manyOrNone: jest.fn().mockImplementation(() => Promise.resolve([])),
  one: jest.fn().mockImplementation(() => Promise.resolve(null)),
  any: jest.fn().mockImplementation(() => Promise.resolve()),
  none: jest.fn().mockImplementation(() => Promise.resolve()),
  multi: jest.fn().mockImplementation(() => Promise.resolve()),
  tx: jest.fn().mockImplementation((fn) => fn(txMock))
};
