import _ from "lodash";
import { Message } from "discord.js";
import { DiscordEventService } from "./discord-event-service";
import { DiscordCommandRepository } from "../repositories/discord-command-repository";
import { DiscordMessageEvent } from "../events/discord-message-event";
import { DiscordEventEmitterService } from "./discord-event-emitter-service";
import { DiscordCommand } from "../classes/discord-command";

export class DiscordCommandService {
	private static _instance: DiscordCommandService;

	public static getInstance(): DiscordCommandService {
		if (_.isNil(DiscordCommandService._instance))
			DiscordCommandService._instance = new DiscordCommandService();

		return DiscordCommandService._instance;
	}

	public async call(
		message: Message,
		callname: string,
		...args: string[]
	): Promise<void> {
		const command = this._repository.getCommand(callname);
		if (!command) {
			DiscordEventEmitterService.getInstance().emit(`unknownCommand`, message);
		} else if (this._isGuildOnlyCommandNotCalledInGuild(command, message)) {
			DiscordEventEmitterService.getInstance().emit(
				`guildOnlyInDm`,
				message,
				command
			);
		} else {
			await command.handleCommand(message, args);
		}
	}

	private _isGuildOnlyCommandNotCalledInGuild(
		command: DiscordCommand,
		message: Message
	) {
		return command.isGuildOnly() && message.channel.type === `dm`;
	}

	private readonly _repository = new DiscordCommandRepository();

	public async init(commands: string): Promise<void> {
		await this._repository.build(commands);
		return DiscordEventService.getInstance()
			.getRepository()
			.registerEventHandler(new DiscordMessageEvent());
	}

	public getRepository(): DiscordCommandRepository {
		return this._repository;
	}
}
