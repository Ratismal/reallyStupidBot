import TwitchClient from 'twitch';

import {
	ComponentAPI,
	SubscribeEvent,
	Variable,
	VariableDefinitionType,
} from '@ayana/bento';

import Loggr from '../loggr';
const console = Loggr.get('Twitch');

export class Twitch {
	public api: ComponentAPI;
	public name: string = 'Twitch';

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	public async onLoad() {
		console.log('Initializing discord...');
		this.client = new Eris.Client(this.config.discord.token, {
			autoreconnect: true,
			firstShardID: 0,
			maxShards: 1,
			restMode: true,
			defaultImageFormat: 'png',
		});

		this.api.forwardEvents(this.client, Object.values(DiscordEvent));

		await this.client.connect();
	}

	public async onUnload() {
		this.client.disconnect({ reconnect: false });
		this.client.removeAllListeners();
		this.client = null;
	}

}
