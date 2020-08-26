import { Message } from "discord.js";
import { DiscordCommandService } from "../services/discord-command-service";

export interface DiscordCommandData {
	readonly name: string;
	readonly description: string;
	readonly aliases: string[];
}

export type DiscordCommandOptions = Partial<DiscordCommandData>;

export abstract class DiscordCommandHandler {
	protected readonly _commandService: DiscordCommandService;

	protected readonly _command: string;

	protected readonly _data: DiscordCommandData;

	constructor(command: string, options: DiscordCommandOptions) {
		this._commandService = DiscordCommandService.getInstance();
		this._command = command;
		this._data = {
			name: command[0].toUpperCase() + command.slice(1),
			description: ``,
			aliases: [],
			...options,
		};
	}

	public getName(): string {
		return this._data.name;
	}

	public getCommand(): string {
		return this._command;
	}

	public getData(): DiscordCommandData {
		return this._data;
	}

	public abstract async handleCommand(
		message: Message,
		args: string[]
	): Promise<void>;
}
