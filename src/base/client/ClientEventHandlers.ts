import { ChatInputCommandInteraction, Guild, GuildMember } from 'discord.js';
import logger from '@moonstar-x/logger';
import { Command } from '../command/Command';

export const handleDebug = (info: string) => {
  logger.debug(info);
};

export const handleError = (error: Error) => {
  logger.error(error);
};

export const handleGuildCreate = (guild: Guild) => {
  logger.info(`Joined guild ${guild.name}.`);
};

// TODO: Delete guild data in database.
export const handleGuildDelete = (guild: Guild) => {
  logger.info(`Left guild ${guild.name}.`);
};

export const handleGuildUnavailable = (guild: Guild) => {
  logger.warn(`Guild ${guild.name} is unavailable.`);
};

export const handleReady = () => {
  logger.info('Connected to Discord - Ready!');
};

export const handleWarn = (info: string) => {
  logger.warn(info);
};

export const handleCommandExecute = (command: Command, interaction: ChatInputCommandInteraction) => {
  const author = interaction.member instanceof GuildMember ? interaction.member.displayName : interaction.user.displayName;
  const guild = interaction.guild?.name || 'Unknown Guild or DM';

  logger.info(`User ${author} issued command ${command.name} in ${guild}.`);
};

export const handleCommandError = (error: unknown, command: Command, interaction: ChatInputCommandInteraction) => {
  const guild = interaction.guild?.name || 'Unknown Guild or DM';

  logger.error(`Something happened when executing ${command.name} in ${guild}.`);
  logger.error(`Command interaction has an ID of ${interaction.id}.`);
  logger.error(error);
};

export const handleCommandRegistered = (command: Command) => {
  logger.info(`Registered command: ${command.name}.`);
};
