import { Database } from '$plugins';
import { Twitch } from '../Twitch';
import { PrivateMessage } from 'twitch-chat-client';
import { Command, CommandContext } from './interfaces';

import {
	ComponentAPI,
	Component,
	Plugin,
	SubscribeEvent,
	Variable,
	VariableDefinitionType,
	FSComponentLoader,
} from '@ayana/bento';

import { TwitchChatEvent } from '$server';
import Loggr from '$loggr';
const console = Loggr.get('TwitchCommands');

export class TwitchCommands {
	public api: ComponentAPI;
	public name: string = 'TwitchCommands';

	public dependencies: Component[] = [Twitch];
	public plugins: Plugin[] = [Database];

	private prefix: string;
	private commands: Map<string, Command> = new Map();
	private db: Database;
	private Twitch: Twitch;

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	public async onLoad() {
		this.prefix = this.config.twitch.prefix || '!';
		this.db = this.api.getPlugin<Database>(Database);
		this.Twitch = this.api.getComponent<Twitch>(Twitch);

		await this.api.loadComponents(FSComponentLoader, __dirname, 'commands');
	}

	public async onChildLoad(command: Command) {
		try {
			await this.addCommand(command);
		} catch (err) {
			console.error(err);
		}
	}

	public async onChildUnload(command: Command) {
		try {
			await this.removeCommand(command);
		} catch (err) {
			console.error(err);
		}
	}

	public async addCommand(command: Command) {
		if (this.commands.has(command.command)) {
			throw new Error('Command already exists');
		}

		console.init('Registered command', command.name);
		this.commands.set(command.command, command);
	}

	public async removeCommand(command: Command) {
		if (this.commands.has(command.command)) {
			this.commands.delete(command.command);
		}
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.PRIVMSG)
	private async handleMessage(channel: string, user: string, message: string, msg: PrivateMessage) {

		if (message.startsWith(this.prefix)) {
			const text = message.substring(this.prefix.length);
			const args = text.split(/\s+/);
			const command = args.shift().toLowerCase();
			const ctx: CommandContext = {
				channel,
				user,
				content: message,
				msg,
				client: this.Twitch.cclient,
				text,
				args,
			};

			if (!this.commands.has(command)) return;

			const c = this.commands.get(command);

			try {
				const res: void | string = await c.execute(ctx);
				if (typeof res === 'string') {
					await ctx.client.say(ctx.channel, res);
				}
			} catch (err) {
				console.error(err);
			}
		}
	}
}
