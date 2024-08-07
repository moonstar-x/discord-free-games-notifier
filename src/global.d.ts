import { APIEmbedField } from 'discord-api-types/v10';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN?: string

      REDIS_URI?: string

      POSTGRES_HOST?: string
      POSTGRES_PORT?: string
      POSTGRES_USER?: string
      POSTGRES_PASSWORD?: string
      POSTGRES_DATABASE?: string
      POSTGRES_MAX_SHARD_CONNECTIONS?: string
    }
  }
}

// RestOrArray typing seems to not go along with Webstorm?
declare module 'discord.js' {
  export class EmbedBuilder {
    setFields(...fields: (APIEmbedField | APIEmbedField[])[]): this;
  }

  export class ActionRowBuilder<T> {
    setComponents(...fields: (T | T[])[]): this;
  }
}
