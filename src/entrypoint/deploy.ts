import logger from '@moonstar-x/logger';
import { createDeployClient } from '../app/deploy';
import { DISCORD_TOKEN } from '../config/app';
import { CommandDeployer } from '../base/command/CommandDeployer';

const client = createDeployClient();
const deployer = new CommandDeployer(DISCORD_TOKEN);

deployer.deployGlobally(client.registry)
  .then((commands) => {
    commands.forEach((command) => {
      logger.info(`Successfully deployed ${command.name} command globally.`);
    });

    logger.info(`Finished deploying ${commands.length} commands globally. These changes can take up to an hour to be reflected on Discord.`);
  })
  .catch((error) => {
    logger.error('Could not deploy commands globally.');
    logger.error(error);
  });
