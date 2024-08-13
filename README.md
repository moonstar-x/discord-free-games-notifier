# Free Games Notifier for Discord

A Discord bot that will notify your server when free games on storefronts like Steam or Epic Games come out.

This bot depends on [free-games-crawler](https://github.com/moonstar-x/free-games-crawler) and site support depends on that service.

For more information, please visit the [official documentation site](https://docs.moonstar-x.dev/discord-free-games-notifier).

## Usage

In order to use this project you'll need the following:

* [Redis](https://redis.io)
* [Doker](https://docker.com) (Recommended) or [Node.js](https://nodejs.org) (At least version 20)

### With Docker (Recommended)

Create a `docker-compose.yml` file with the following:

```yaml
services:
  bot:
    image: ghcr.io/moonstar-x/discord-free-games-notifier:latest
    restart: unless-stopped
    depends_on:
      - redis
      - postgres
    environment:
      DISCORD_TOKEN: YOUR_DISCORD_TOKEN_HERE
      DISCORD_SHARING_ENABLED: false
      DISCORD_SHADING_COUNT: auto
      DISCORD_PRESENCE_INTERVAL: 30000
      REDIS_URI: redis://redis:6379
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_DATABASE: free-games
      POSTGRES_USER: discord
      POSTGRES_PASSWORD: SOMETHING_SECRET
  
  crawler:
    image: ghcr.io/moonstar-x/free-games-crawler:latest
    restart: unless-stopped
    depends_on:
      - redis
    environment:
      REDIS_URI: redis://redis:6379

  redis:
    image: redis:7.4-rc2-alpine
    restart: unless-stopped
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - ./redis:/data

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes:
      - ./postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: free-games
      POSTGRES_USER: discord
      POSTGRES_PASSWORD: SOMETHING_SECRET
```

> You can also the image `moonstarx/discord-free-games-notifier:latest` and `moonstarx/free-games-crawler:latest` if you prefer DockerHub.
> 
> Make sure to replace `SOMETHING_SECRET` with a password for your database and `YOUR_DISCORD_TOKEN_HERE` with your bot's token.

And start it up:

```bash
docker compose up -d
```

Once you have it, you should deploy the commands. To do this, run:

```bash
docker compose run bot npm run deploy:prod
```

### With Node.js

Make sure to have at least Node.js 20.

First, clone this repository:

```bash
git clone https://github.com/moonstar-x/discord-free-games-notifier
```

Install the dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

Create an `.env` file and add your configuration:

```text
DISCORD_TOKEN=YOUR_DISCORD_TOKEN_HERE
DISCORD_SHARDING_ENABLED=false
DISCORD_SHARDING_COUNT=2
DISCORD_PRESENCE_INTERVAL=30000

REDIS_URI=redis://localhost:6379

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=dev
POSTGRES_USER=dev
POSTGRES_PASSWORD=password
```

Deploy the commands:

```bash
npm run deploy:prod
```

And start the bot:

```bash
npm start
```

> This assumes you have a Redis and a Postgres instance running on `localhost`.

### Configuration

You can configure the bot with the following environment variables.

| Name                      | Required | Default | Description                                                                                                                                                                      |
|---------------------------|----------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| DISCORD_TOKEN             | Yes      |         | The token to connect your bot to Discord.                                                                                                                                        |
| DISCORD_SHARDING_ENABLED  | No       | false   | Whether the bot should start in sharded mode or not. This is necessary if your bot is in more than 2000 servers.                                                                 |
| DISCORD_SHARDING_COUNT    | No       | auto    | The amount of shards to spawn if sharding is enabled. It should be a number greater than 1. You can leave this as `auto` to use an automatic value generated for your own needs. |
| DISCORD_PRESENCE_INTERVAL | No       | 300000  | The amount of milliseconds to wait before the bot changes its presence or activity.                                                                                              |
| REDIS_URI                 | Yes      |         | The Redis URI shared with the crawler service.                                                                                                                                   |
| POSTGRES_HOST             | Yes      |         | The database host to connect to.                                                                                                                                                 |
| POSTGRES_PORT             | No       | 5432    | The port to use to connect to the database.                                                                                                                                      |
| POSTGRES_DATABASE         | Yes      |         | The name of the database to connect to.                                                                                                                                          |
| POSTGRES_USER             | Yes      |         | The username to connect to the database with.                                                                                                                                    |
| POSTGRES_PASSWORD         | Yes      |         | The password to connect to the database with.                                                                                                                                    |

### Commands

Once you get the bot running you will have access to the following commands:

| Command                | Notes                                          | Description                                                                                              |
|------------------------|------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| /configure channel     | Guild only. Requires `ManageGuild` permission. | Set the channel to send the notifications to. Must be a text channel.                                    |
| /configure language    | Guild only. Requires `ManageGuild` permission. | Set the language in which the notifications are sent. Currently supported: English, French, and Spanish. |
| /configure storefronts | Guild only. Requires `ManageGuild` permission. | Enable or disable each storefront to be notified about.                                                  |
| /help                  |                                                | Get a short help message regarding how to use the bot.                                                   |
| /info                  | Guild only.                                    | Get a message with the information that the bot has stored for the server.                               |
| /offers                |                                                | Get a list of all the currently available game offers.                                                   |

## Development

Clone this repository:

```bash
git clone https://github.com/moonstar-x/discord-free-games-notifier
```

Install the dependencies:

```bash
npm install
```

Create the development environment:

```bash
cd _dev && docker compose up
```

And run the bot locally:

```bash
npm run dev
```

## Testing

You can run unit tests by using:

```bash
npm run test
```

Or, if you wish to have test watch enabled:

```bash
npm run test:watch
```

## Building

### Docker

To build this project you should use [Docker](https://docker.com).

To build the image locally, you can run:

```bash
docker build -t test/discord-free-games-notifier .  
```

### Node.js

To build this project with Node.js, run the following command:

```bash
npm run build
```
