[![discord](https://img.shields.io/discord/730998659008823296.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/mhj3Zsv)
[![ci-build-status](https://img.shields.io/github/workflow/status/moonstar-x/discord-free-games-notifier/CI?logo=github)](https://github.com/moonstar-x/discord-free-games-notifier)
[![open-issues-count](https://img.shields.io/github/issues-raw/moonstar-x/discord-free-games-notifier?logo=github)](https://github.com/moonstar-x/discord-free-games-notifier)
[![docker-image-size](https://img.shields.io/docker/image-size/moonstarx/discord-free-games-notifier?logo=docker)](https://hub.docker.com/repository/docker/moonstarx/discord-free-games-notifier)
[![docker-pulls](https://img.shields.io/docker/pulls/moonstarx/discord-free-games-notifier?logo=docker)](https://hub.docker.com/repository/docker/moonstarx/discord-free-games-notifier)

# Discord Free Games Notifier

A Discord bot that will notify when free games on Steam or Epic Games come out. The bot will fetch offers from Steam and Epic Games every 30 minutes and will send a notification message to the set channel once a new offer is found.

## Requirements

To self-host this bot, you'll need the following:

* [git](https://git-scm.com/)
* [node.js](https://nodejs.org/en/) (Version 12 or higher is required.)

## Installation

In order to self-host this bot, first you'll need to clone this repository.

```text
git clone https://github.com/moonstar-x/discord-free-games-notifier.git
```

Once cloned, proceed to install the dependencies:

```text
npm ci --only=prod
```

Or, if you prefer to install everything including `devDependencies`, you may run:

```text
npm install
```

After you have [configured](#configuration) your bot, you can run it with:

```text
npm start
```

## Configuration

There are two ways to configure the bot, one with a `settings.json` file inside the `config` folder or with environment variables.

Here's a table with the available options you may configure:

| Environment Variable              | JSON Property               | Required                    | Type               | Description                                                                                                                |
|-----------------------------------|-----------------------------|-----------------------------|--------------------|----------------------------------------------------------------------------------------------------------------------------|
| DISCORD_TOKEN                     | `token`                     | Yes.                        | `string`           | The bot's token.                                                                                                           |
| DISCORD_PREFIX                    | `prefix`                    | No. (Defaults to: `$`)      | `string`           | The bot's prefix. Used for the commands.                                                                                   |
| DISCORD_OWNER_ID                  | `owner_id`                  | No. (Defaults to: `null`)   | `string` or `null` | The ID of the bot's owner.                                                                                                 |
| DISCORD_OWNER_REPORTING           | `owner_reporting`           | No. (Defaults to: `false`)  | `boolean`          | Whether the bot should send error reports to the owner via DM when a command errors.                                       |
| DISCORD_PRESENCE_REFRESH_INTERVAL | `presence_refresh_interval` | No. (Defaults to: `900000`) | `number` or `null` | The time interval in ms in which the bot updates its presence. If set to `null` the presence auto update will be disabled. |

> **Note on `Required`**: A required settings HAS to be in the JSON or environment variables.
>
> **Note on `Default`**: If a setting is missing from the JSON or environment variables, the default value takes place.
>
> * To see how to find the IDs for users or channels, you can check out [this guide](<https://github.com/moonstar-x/discord-downtime-notifier/wiki/Getting-User,-Channel-and-Server-IDs>).
> * If you don't have a Discord token yet, you can see a guide on how to get one [here](<https://github.com/moonstar-x/discord-downtime-notifier/wiki/Getting-a-Discord-Bot-Token>).

### Using the Config File

Inside the `config` folder you will see a file named `settings.json.example`, rename it to `settings.json` and replace all the properties with your own values.

Your file should look like this:

```json
{
  "token": "YOUR_DISCORD_TOKEN",
  "prefix": "!",
  "owner_id": "YOUR_USER_ID",
  "owner_reporting": false,
  "presence_refresh_interval": 900000
}
```

## Usage

You can start the bot by running:

```text
npm start
```

You'll need to configure which channel should be used for the bot to send notifications. To do this, run the command:

```text
n!setchannel <channel_mention>
```

> Replace `n!` with your actual bot prefix and `<channel_mention>` with the mention of the channel you wish to set.
>
> Make sure that the channel you're setting is viewable by the bot and that you have the `MANAGE_CHANNELS` permission.

## Commands

The following commands are available:

| Command                          | Aliases     | Description                                                                                                                                                                                                           |
|----------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `n!help`                         | `n!h`       | Receive a message with the available commands.                                                                                                                                                                        |
| `n!setchannel <channel_mention>` | `n!channel` | Set the channel that should be used for the bot to send the automatic game offer announcements. The user issuing this command must have the `MANAGE_CHANNELS` permission.                                             |
| `n!disable`                      |             | Disable the automatic game offer announcements on this server. You can still use the `n!offers` command. The user issuing this command must have the `MANAGE_CHANNELS` permission.                                    |
| `n!offers <provider>`            |             | Get a list of current available offers. Replace `<provider>` with **epic** for Epic Games Store offers or **steam** for Steam offers. You can omit this argument to receive all offers from all providers supported.  |

## Docker Support

You can use the bot through Docker.

### Volumes

You may use the following volumes:

| Volume          | Description                                                                                                                  |
|-----------------|------------------------------------------------------------------------------------------------------------------------------|
| /opt/app/config | Volume where the config file is located. Generally not necessary since you can configure the bot with environment variables. |
| /opt/app/data   | Volume where the data folder is located. Here you can find the sqlite database file. Required to set up.                     |

### Environment Variables

You can configure the bot using environment variables. To do so, check out [configuration](#configuration) for a full list of what environment variables are used.

### Starting the Container

Starting the bot's container can be done by running:

```text
docker run -it -e DISCORD_TOKEN="YOUR DISCORD TOKEN" -v "/local/folder/for/data":"/opt/app/data" moonstarx/discord-free-games-notifier:latest
```

## Add this bot to your server

You can add this bot to your server by clicking in the image below:

[![Add this bot to your server](https://i.imgur.com/SVAwPTU.png)](https://discord.com/oauth2/authorize?client_id=795561965954269205&scope=bot&permissions=2048)

> The prefix for this bot is `n!`

## Author

This bot was made by [moonstar-x](https://github.com/moonstar-x).
