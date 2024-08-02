import pgPromise from 'pg-promise';
import {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DATABASE,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_MAX_SHARD_CONNECTIONS
} from '../../config/app';

const pgp = pgPromise();

export const db = pgp({
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  database: POSTGRES_DATABASE,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  max: POSTGRES_MAX_SHARD_CONNECTIONS
});
