import { createClient } from '../app/client';
import { DISCORD_TOKEN } from '../config/app';

const client = createClient();

client.login(DISCORD_TOKEN);
