import path from 'path';
import { IntentsBitField } from 'discord.js';
import { ExtendedClient } from '../base/client/ExtendedClient';

export const createDeployClient = () => {
  const client = new ExtendedClient({
    intents: [IntentsBitField.Flags.Guilds] as const
  });

  client.registry.registerIn(path.join(__dirname, '../commands'));

  return client;
};
