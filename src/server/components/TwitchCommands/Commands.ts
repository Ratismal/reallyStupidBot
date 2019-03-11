import { Database } from '$plugins';
import { Twitch } from '../Twitch';
import {
	ComponentAPI,
	Component,
	Plugin,
	SubscribeEvent,
	Variable,
	VariableDefinitionType,
} from '@ayana/bento';

import { TwitchChatEvent } from '$server';
import Loggr from '$loggr';
const console = Loggr.get('TwitchCommands');

export class TwitchCommands {
	public api: ComponentAPI;
	public name: string = 'TwitchCommands';

	public dependencies: Component[] = [Twitch];
	public plugins: Plugin[] = [Database];

	private db: Database;

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	public async onLoad() {
		this.db = this.api.getPlugin<Database>(Database);
	}

	public async onUnload() {
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.PRIVMSG)
	private async handleMessage(channel: any, user: any, message: any, msg: any) {
		console.log(channel, user, message, msg);
	}
}
