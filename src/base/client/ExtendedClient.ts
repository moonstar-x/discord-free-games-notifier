import { Client, ClientOptions, ClientEvents, ChatInputCommandInteraction } from 'discord.js';
import { CommandRegistry } from '../command/CommandRegistry';
import { InteractionDispatcher } from '../command/InteractionDispatcher';
import { Command } from '../command/Command';
import { OffersNotifier } from '../../features/gameOffers/classes/OffersNotifier';

export interface ExtendedClientEvents extends ClientEvents {
  commandExecute: [command: Command, interaction: ChatInputCommandInteraction]
  commandError: [error: unknown, command: Command, interaction: ChatInputCommandInteraction]
  commandRegistered: [command: Command]
}

export declare interface ExtendedClient {
  on<K extends keyof ExtendedClientEvents>(event: K, listener: (...args: ExtendedClientEvents[K]) => void): this;
  on<S extends string | symbol>(
    event: Exclude<S, keyof ExtendedClientEvents>,
    listener: (...args: unknown[]) => void
  ): this;

  once<K extends keyof ExtendedClientEvents>(event: K, listener: (...args: ExtendedClientEvents[K]) => void): this;
  once<S extends string | symbol>(
    event: Exclude<S, keyof ExtendedClientEvents>,
    listener: (...args: unknown[]) => void
  ): this;

  emit<K extends keyof ExtendedClientEvents>(event: K, ...args: ExtendedClientEvents[K]): boolean;
  emit<S extends string | symbol>(event: Exclude<S, keyof ExtendedClientEvents>, ...args: unknown[]): boolean;

  off<K extends keyof ExtendedClientEvents>(event: K, listener: (...args: ExtendedClientEvents[K]) => void): this;
  off<S extends string | symbol>(
    event: Exclude<S, keyof ExtendedClientEvents>,
    listener: (...args: unknown[]) => void
  ): this;

  removeAllListeners<K extends keyof ExtendedClientEvents>(event?: K): this;
  removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ExtendedClientEvents>): this;
}

export class ExtendedClient extends Client {
  public readonly registry: CommandRegistry;
  public readonly dispatcher: InteractionDispatcher;
  public readonly notifier: OffersNotifier;

  public constructor(options: ClientOptions) {
    super(options);

    this.registry = new CommandRegistry(this);
    this.dispatcher = new InteractionDispatcher(this, this.registry);
    this.notifier = new OffersNotifier(this);

    this.registerBasicHandlers();
  }

  private registerBasicHandlers(): void {
    this.on('interactionCreate', (interaction) => this.dispatcher.handleInteraction(interaction));
    this.on('ready', async () => await this.notifier.subscribe());
  }
}
