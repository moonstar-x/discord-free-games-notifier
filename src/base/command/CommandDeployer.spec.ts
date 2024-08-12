import { CommandDeployer } from './CommandDeployer';
import { Command } from './Command';
import { CommandRegistry } from './CommandRegistry';
import { REST } from 'discord.js';
import { Routes } from 'discord-api-types/v10';

jest.mock('discord.js', () => {
  const restMock: Record<string, jest.Mock> = {
    put: jest.fn(),
    get: jest.fn()
  };
  restMock.setToken = jest.fn().mockReturnValue(restMock);

  return {
    ...jest.requireActual('discord.js'),
    REST: jest.fn().mockReturnValue(restMock)
  };
});

describe('Base > Command > CommandDeployer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('class CommandDeployer', () => {
    let deployer: CommandDeployer;
    let deployerRest: REST;

    const command = {
      builder: 'builder'
    } as unknown as Command;
    const registry = {
      getAll: jest.fn().mockReturnValue([command])
    } as unknown as CommandRegistry;

    beforeEach(() => {
      deployer = new CommandDeployer('token');
      deployerRest = (deployer as unknown as { rest: REST }).rest;
    });

    it('should be defined.', () => {
      expect(CommandDeployer).toBeDefined();
    });

    describe('deployGlobally()', () => {
      beforeEach(() => {
        (deployerRest.get as jest.Mock).mockResolvedValue({ id: '123' });
      });

      it('should deploy all commands.', async () => {
        await deployer.deployGlobally(registry);
        expect(deployerRest.put).toHaveBeenCalledWith(Routes.applicationCommands('123'), { body: ['builder'] });
      });
    });

    describe('deployToGuild()', () => {
      beforeEach(() => {
        (deployerRest.get as jest.Mock).mockResolvedValue({ id: '123' });
      });

      it('should deploy all commands.', async () => {
        await deployer.deployToGuild(registry, 'guild');
        expect(deployerRest.put).toHaveBeenCalledWith(Routes.applicationGuildCommands('123', 'guild'), { body: ['builder'] });
      });
    });
  });
});
