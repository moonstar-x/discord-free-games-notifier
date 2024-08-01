import { ExtendedClient } from '../base/client/ExtendedClient';
import logger from '@moonstar-x/logger';
import { CommandDeployer } from '../base/command/CommandDeployer';

const client = {
  registry: {}
} as unknown as ExtendedClient;

const deployer = {
  deployGlobally: jest.fn().mockResolvedValue([
    { name: 'cmd1' },
    { name: 'cmd2' }
  ])
} as unknown as CommandDeployer;

jest.mock('@moonstar-x/logger');

jest.mock('../app/deploy', () => {
  return {
    createDeployClient: jest.fn().mockReturnValue(client)
  };
});

jest.mock('../base/command/CommandDeployer', () => {
  return {
    CommandDeployer: jest.fn().mockReturnValue(deployer)
  };
});

describe('Entrypoint > Deploy', () => {
  const load = async () => {
    jest.isolateModules(() => {
      require('./deploy');
    });
    await Promise.resolve();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should deploy all commands globally.', async () => {
    await load();
    expect(deployer.deployGlobally).toHaveBeenCalledWith(client.registry);
  });

  it('should log deployment messages.', async () => {
    await load();

    expect(logger.info).toHaveBeenCalledWith('Successfully deployed cmd1 command globally.');
    expect(logger.info).toHaveBeenCalledWith('Successfully deployed cmd2 command globally.');
    expect(logger.info).toHaveBeenCalledWith('Finished deploying 2 commands globally. These changes can take up to an hour to be reflected on Discord.');
  });

  it('should log error messages if deployment fails.', async () => {
    const error = new Error('Oops');
    (deployer.deployGlobally as jest.Mock).mockRejectedValueOnce(error);

    await load();

    expect(logger.error).toHaveBeenCalledWith('Could not deploy commands globally.');
    expect(logger.error).toHaveBeenCalledWith(error);
  });
});
