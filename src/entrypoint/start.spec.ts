const requiredRef = {
  required: (name: string) => name
};

jest.mock('./startSingle', () => {
  requiredRef.required('single');
});

jest.mock('./startSharded', () => {
  requiredRef.required('sharded');
});

describe('Entrypoint > Start', () => {
  const requiredMock = jest.spyOn(requiredRef, 'required', undefined as never);

  const load = async () => {
    jest.isolateModules(() => {
      require('./start');
    });
    await Promise.resolve();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should require single if sharding is disabled.', async () => {
    jest.mock('../config/app', () => {
      return {
        DISCORD_SHARDING_ENABLED: false
      };
    });
    await load();
    expect(requiredMock).toHaveBeenCalledWith('single');
  });

  it('should require sharded if sharding is enabled.', async () => {
    jest.mock('../config/app', () => {
      return {
        DISCORD_SHARDING_ENABLED: true
      };
    });
    await load();
    expect(requiredMock).toHaveBeenCalledWith('sharded');
  });
});
