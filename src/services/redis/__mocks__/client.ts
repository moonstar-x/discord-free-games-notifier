const client = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  keys: jest.fn(),
  mGet: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn()
};

export const createRedisClient = jest.fn().mockReturnValue(client);

export const withRedis = jest.fn().mockImplementation((fn) => fn(client));
