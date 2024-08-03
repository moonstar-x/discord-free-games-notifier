export const createClient = jest.fn().mockReturnValue({
  connect: jest.fn(),
  disconnect: jest.fn()
});

export default {
  createClient
};
