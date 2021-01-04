[![discord](https://img.shields.io/discord/730998659008823296.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/mhj3Zsv)
[![trello](https://img.shields.io/badge/Trello-discord--free--games--notifier-ff69b4)](https://trello.com/b/Iz8cQJAD/discord-free-games-notifier)
[![ci-build-status](https://img.shields.io/github/workflow/status/moonstar-x/discord-free-games-notifier/CI?logo=github)](https://github.com/moonstar-x/discord-free-games-notifier)
[![open-issues-count](https://img.shields.io/github/issues-raw/moonstar-x/discord-free-games-notifier?logo=github)](https://github.com/moonstar-x/discord-free-games-notifier)
[![docker-image-size](https://img.shields.io/docker/image-size/moonstarx/discord-free-games-notifier?logo=docker)](https://hub.docker.com/repository/docker/moonstarx/discord-free-games-notifier)
[![docker-pulls](https://img.shields.io/docker/pulls/moonstarx/discord-free-games-notifier?logo=docker)](https://hub.docker.com/repository/docker/moonstarx/discord-free-games-notifier)

# discord-free-games-notifier

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

If you prefer to install everything including the devDependencies, you may run:

```text
npm install
```
## Configuration

There are two ways to configure the bot, one with a `settings.json` file inside the `config` folder or with environment variables.

Here's a table with the available options you may configure:

| Environment Variable   | JSON property            | Required                                                                                                                  | Description                                                                               |
|------------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| DISCORD_TOKEN          | `discord_token`          | Yes                                                                                                                       | Your Discord bot's token.                                                                 |
| PREFIX                 | `prefix`                 | No (Defaults to `$`)                                                                                                      | The prefix the bot will use for the commands.                                             |
| OWNER_ID               | `owner_id`               | No                                                                                                                        | The ID of the owner of the bot, mainly for owner-only commands. (None available yet.)     |
| INVITE_URL             | `invite_url`             | No                                                                                                                        | Invite URL for the bot. (Nothing is done with this URL yet.)                              |

> * To see how to find the IDs for users or channels, you can check out [this guide](<https://github.com/moonstar-x/discord-downtime-notifier/wiki/Getting-User,-Channel-and-Server-IDs>).
> * If you don't have a Discord token yet, you can see a guide on how to get one [here](<https://github.com/moonstar-x/discord-downtime-notifier/wiki/Getting-a-Discord-Bot-Token>).

## Using the Config File

Inside the `config` folder you will see a file named `settings.json.example`, rename it to `settings.json` and replace all the properties with your own values.

Your file should look like this:

```json
{
  "discord_token": "YOUR DISCORD TOKEN",
  "prefix": "!",
  "owner_id": "YOUR USER ID (IF YOU'RE THE OWNER)",
  "invite_url": "YOUR BOT INVITE URL HERE",
}
```

## Usage

You can start the bot by running:

```text
npm start
```

You'll need to configure which channel should be used for the bot to send notifications. To do this, run the command:

```text
$setchannel <channel_mention>
```

> Replace `$` with your actual bot prefix and `<channel_mention>` with the mention of the channel you wish to set.
>
> Make sure that the channel you're setting is viewable by the bot and that you have the `MANAGE_CHANNELS` permission.

## Commands

The following commands are available:

| Command                         | Description                                                                                                                                                                                                           |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `$help`                         | Receive a message with the available commands.                                                                                                                                                                        |
| `$setchannel <channel_mention>` | Set the channel that should be used for the bot to send the automatic game offer announcements. The user issuing this command must have the `MANAGE_CHANNELS` permission.                                             |
| `$offers <provider>`            | Get a list of current available offers. Replace `<provider>` with **epic** for Epic Games Store offers or **steam** for Steam offers. You can omit this argument to receive all offers from all providers supported.  |

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
docker run -it -e DISCORD_TOKEN="YOUR DISCORD TOKEN" -e CHANNEL_ID="YOUR CHANNEL ID" -v "/local/folder/for/data":"/opt/app/data" moonstarx/discord-free-games-notifier:latest
```

## Add this bot to your server

You can add this bot to your server by clicking in the image below:
[![Add this bot to your server](https://i.imgur.com/SVAwPTU.png)](https://discord.com/oauth2/authorize?client_id=795561965954269205&scope=bot&permissions=2048)

## Author

This bot was made by [moonstar-x](https://github.com/moonstar-x).
