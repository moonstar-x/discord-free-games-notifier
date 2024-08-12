import { REST, User } from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import { CommandRegistry } from './CommandRegistry';
import { Command } from './Command';

export class CommandDeployer {
  private readonly rest: REST;

  public constructor(token: string) {
    this.rest = new REST({ version: '10' }).setToken(token);
  }

  public async deployGlobally(registry: CommandRegistry): Promise<Command[]> {
    const clientId = await this.getClientId();
    const commands = registry.getAll();
    const builders = commands.map((command) => command.builder);

    await this.rest.put(Routes.applicationCommands(clientId), { body: builders });

    return commands;
  }

  public async deployToGuild(registry: CommandRegistry, guildId: string): Promise<Command[]> {
    const clientId = await this.getClientId();
    const commands = registry.getAll();
    const builders = commands.map((command) => command.builder);

    await this.rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: builders });

    return commands;
  }

  private async getClientId(): Promise<string> {
    const response = await this.rest.get(Routes.user()) as User;
    return response.id;
  }
}
