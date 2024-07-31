import { Collection } from 'discord.js';
import requireAll from 'require-all';
import { flatten } from 'flat';
import { ExtendedClient } from '../client/ExtendedClient';
import { Command } from './Command';
import { validateCommand } from './validators';
import { CommandRegistryError } from '../error/command';
import { Class } from '../../utils/types';

export class CommandRegistry {
  public readonly client: ExtendedClient;
  public readonly commands: Collection<string, Command>;

  public constructor(client: ExtendedClient) {
    this.client = client;
    this.commands = new Collection();
  }

  public get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  public getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  public size(): number {
    return this.commands.size;
  }

  public register(command: Command): this;
  public register(commands: Command[]): this;
  public register(command: Command | Command[]): this {
    if (Array.isArray(command)) {
      this.registerCommands(command);
    } else {
      this.registerCommand(command);
    }

    return this;
  }

  public registerIn(path: string): this {
    const commandModules: Record<string, Class<Command>> = flatten(
      requireAll({
        dirname: path,
        filter: /^(?!.*spec\.(?:ts|js)$).*\.(?:ts|js)$/i,
        recursive: true
      })
    );
    const commands = Object.values(commandModules).map((Command) => new Command(this.client));

    this.registerCommands(Object.values(commands));
    return this;
  }

  private registerCommand(command: Command): void {
    validateCommand(command);

    if (this.get(command.name)) {
      throw new CommandRegistryError(`Command ${command.name} is already registered. Command names must be unique.`);
    }

    this.commands.set(command.name, command);
    this.client.emit('commandRegistered', command);
  }

  private registerCommands(commands: Command[]): void {
    for (const command of commands) {
      this.registerCommand(command);
    }
  }
}
