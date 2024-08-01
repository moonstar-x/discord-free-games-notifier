import { Command } from './Command';
import { CommandValidationError } from '../error/command';

const NAME_PATTERN = /^[\P{Lu}\p{N}_-]+$/u;
const NAME_MIN = 1;
const NAME_MAX = 32;

const DESCRIPTION_MIN = 1;
const DESCRIPTION_MAX = 100;

const validateName = (name: string) => {
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    throw new CommandValidationError(`Command /${name} has an invalid name. It must be between ${NAME_MIN} and ${NAME_MAX} characters.`);
  }

  if (!NAME_PATTERN.test(name)) {
    throw new CommandValidationError(`Command /${name} has an invalid name. Please use all lower-cased characters.`);
  }
};

const validateDescription = (name: string, description: string) => {
  if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) {
    throw new CommandValidationError(`Command /${name} has an invalid description. It must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters.`);
  }
};

export const validateCommand = (command: Command) => {
  validateName(command.name);
  validateDescription(command.name, command.description);
};
