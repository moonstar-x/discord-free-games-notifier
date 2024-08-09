import path from 'path';
import { GatewayIntentBits } from 'discord.js';
import { ExtendedClient } from '../base/client/ExtendedClient';
import * as ClientEventHandlers from '../base/client/ClientEventHandlers';
import { DEBUG_ENABLED } from '../config/context';

export const createClient = () => {
  const client = new ExtendedClient({
    intents: [GatewayIntentBits.Guilds] as const
  });

  if (DEBUG_ENABLED) {
    client.on('debug', ClientEventHandlers.handleDebug);
  }

  client.on('error', ClientEventHandlers.handleError);
  client.on('guildCreate', ClientEventHandlers.handleGuildCreate);
  client.on('guildDelete', ClientEventHandlers.handleGuildDelete);
  client.on('guildUnavailable', ClientEventHandlers.handleGuildUnavailable);
  client.on('ready', ClientEventHandlers.handleReady);
  client.on('warn', ClientEventHandlers.handleWarn);
  client.on('commandExecute', ClientEventHandlers.handleCommandExecute);
  client.on('commandError', ClientEventHandlers.handleCommandError);
  client.on('commandRegistered', ClientEventHandlers.handleCommandRegistered);

  client.registry.registerIn(path.join(__dirname, '../commands'));

  return client;
};
