import TwitchClient from 'twitch';
import ChatClient from 'twitch-chat-client';

import {
	ComponentAPI,
	SubscribeEvent,
	Variable,
	VariableDefinitionType,
} from '@ayana/bento';

import Loggr from '$loggr';
const console = Loggr.get('Twitch');

export class Twitch {
	public api: ComponentAPI;
	public name: string = 'Twitch';

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	private cclient: ChatClient;
	private client: TwitchClient;

	public async onLoad() {
	}

	public async onUnload() {
	}

}
