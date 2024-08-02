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
