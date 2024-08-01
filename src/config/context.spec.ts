import * as configModule from './context';

describe('Config > Context', () => {
  let config: typeof configModule;

  const oldArgv = [...process.argv];

  const resetModule = () => {
    jest.resetModules();
    config = require('./context');
  };

  beforeAll(() => {
    resetModule();
  });

  afterEach(() => {
    process.argv = oldArgv;
    resetModule();
  });

  it('should export valid DEBUG_ENABLED if argv contains --debug.', () => {
    process.argv = ['--arg', '--debug'];
    resetModule();

    expect(config.DEBUG_ENABLED).toBe(true);
  });

  it('should export valid DEBUG_ENABLED if argv does not contain --debug.', () => {
    process.argv = ['--arg'];
    resetModule();

    expect(config.DEBUG_ENABLED).toBe(false);
  });
});
