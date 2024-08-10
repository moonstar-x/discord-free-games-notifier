import { createClient } from '../app/client';
import { DISCORD_TOKEN } from '../config/app';
import { runMigrations } from '../app/migration';

const client = createClient();

runMigrations()
  .then(() => {
    client.login(DISCORD_TOKEN);
  });
