/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { Discord } = require('discord.js');
const { ExtendedClient } = require('@greencoast/discord.js-extended/dist/classes/ExtendedClient').default;
const DataProvider = require('@greencoast/discord.js-extended/dist/classes/data/DataProvider').default;

const { Pool } = require('pg');
const format = require('pg-format');

const GLOBAL_KEY = {id: "global"};

const logger = require('@greencoast/logger');

/**
 * A {@link DataProvider} implemented with a PostgreSQL backend. Requires the package [level](https://www.npmjs.com/package/pg).
 */
class PostgresDataProvider extends DataProvider {
  /**
   * Instantiate a LevelDB data provider.
   * @param client The client that this data provider will be used by.
   * @param location The fully resolved path where the LevelDB database will be saved. This must resolve to a directory.
   */
  constructor(client, location) {
      super(client);
      this.location = location;
      this.pg = null;
  }

  /**
   * Initialize this POstgreSQL data provider. This creates the database instance and the
   * database files inside the location specified.
   * @returns A promise that resolves this LevelDB data provider once it's ready.
   */
  init() {
    if (this.db) {
      return Promise.resolve(this);
    }
    return new Promise((resolve, reject) => {
      const pool = new Pool({
        connectionString: this.location,
        ssl: {
          rejectUnauthorized: false
        }
      });
      pool
        .query("CREATE TABLE IF NOT EXISTS guilds(id SERIAL PRIMARY KEY, guild_id TEXT UNIQUE)")
        .then(() => {
          this.pg = pool;
          this.client.emit('dataProviderInit', this);
          return resolve(this);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  /**
   * Gracefully destroy this LevelDB data provider. This closes the database connection.
   * Once this is called, this data provider will be unusable.
   * @returns A promise that resolves once this data provider is destroyed.
   * @emits `client#dataProviderDestroy`
   */
  destroy() {
    if (!this.pg) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.pg.end((err) => {
        if (err) {
          return reject(err);
        }
        this.pg = null;
        this.client.emit('dataProviderDestroy', this);
        return resolve();
      });
    });
  }

  async _get(guild, key, defaultValue) {
    const { id } = guild;

    try {
      let res = await this.pg.query(format('SELECT %I FROM guilds WHERE guild_id = %L', key, id));
      // if not result
      if (res.rowCount == 0) {
        return defaultValue;
      // if more than one result (normally impossible because guild_id is unique)
      } else if (res.rowCount > 1) {
        console.error("More than one result in guild_id which should be unique !");
      }
      
      var result = res.rows[0][key];
      try {
        var t_array = JSON.parse(result);
        if (t_array instanceof Array) {
          result = t_array;
        }

      } catch { }

      return result;
    }
    catch (err) {
      // if key (column) is not set
      if (err.code === '42703') {
        return defaultValue;
      } else {
        throw err;
      }
    }
  }

  /**
   * Get a value for a key in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/main/stable/class/Guild) for which the data will be queried.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  async get(guild, key, defaultValue) {
    return await this._get(guild, key, defaultValue);
  }

  /**
   * Get a value for a key in a global scope.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  async getGlobal(key, defaultValue) {
    return this._get(GLOBAL_KEY, key, defaultValue);
  }

  async _set(guild, key, value) {
    const { id } = guild;
    logger.debug("Set value:", value);

    // format expanse array and does not support literals
    // https://github.com/datalanche/node-pg-format/issues/3
    if (value instanceof Array) {
      value = JSON.stringify(value);
    }

    // TODO: quite ugly for the moment, all data are stored as TEXT, do object doing the interface to store the proper type etc
    // assert COLLUMN exist
    try {
      await this.pg.query(format("ALTER TABLE guilds ADD COLUMN IF NOT EXISTS %I TEXT", key));
      await this.pg.query(format(
        'INSERT INTO guilds(guild_id, %I) \
        VALUES (%L, %L) \
        ON CONFLICT (guild_id) DO UPDATE \
        SET %I = excluded.%I',
        key, id, value, key, key
      ));
    }
    catch (err) {
      console.error(err);
    }
  }

  /**
   * Set a value for a key in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/main/stable/class/Guild) for which the data will be set.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  async set(guild, key, value) {
    return await this._set(guild, key, value);
  }

  /**
   * Set a value for a key in a global scope.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  async setGlobal(key, value) {
    return await this._set(GLOBAL_KEY, key, value);
  }

  async _delete(guidl, key) {
    return await this._set(guild, key, null);
  }

  /**
   * Delete a key-value pair in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/main/stable/class/Guild) for which the key-value pair will be deleted.
   * @param key The key to delete.
   * @returns A promise that resolves the data that was deleted.
   */
  async delete(guild, key) {
    return await this._delete(guild, key, null);
  }

  /**
   * Delete a key-value pair in a global scope.
   * @param key The key to delete.
   * @returns A promise that resolves the data that was deleted.
   */
  async deleteGlobal(key) {
    return await this._delete(GLOBAL_KEY, key);
    // TODO: EVENT ? dans set & get aussi
  }


  async _clear(guild) {
    const { id } = guild;

    await this.pg.query(format(
      'DELETE FROM guilds WHERE guild_id = %I',
      id
    ));
  }

  /**
   * Clear all data in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/main/stable/class/Guild) to clear the data from.
   * @returns A promise that resolves once all data is deleted.
   * @emits `client#dataProviderClear`
   */
  async clear(guild) {
    await this._clear(guild);
    this.client.emit('dataProviderClear', guild);
  }

  /**
   * Clear all data in a global scope.
   * @returns A promise that resolves once all data is deleted.
   * @emits `client#dataProviderClear`
   */
  async clearGlobal() {
    await this._clear(GLOBAL_KEY);
    this.client.emit('dataProviderClear', null);
  }
}

module.exports = PostgresDataProvider;
