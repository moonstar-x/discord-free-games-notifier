import { DISCORD_SHARDING_ENABLED } from '../config/app';

if (DISCORD_SHARDING_ENABLED) {
  require('./startSharded');
} else {
  require('./startSingle');
}
