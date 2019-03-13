import * as Eris from 'eris';
import { User } from 'eris';

import {
	ComponentAPI,
	SubscribeEvent,
	Variable,
	VariableDefinitionType,
} from '@ayana/bento';

import { DiscordEvent } from '../Constants';

import Loggr from '$loggr';
const console = Loggr.get('Discord');

export class Discord {
	public api: ComponentAPI;
	public name: string = 'Discord';

	public client: Eris.Client = null;

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

	@SubscribeEvent(Discord, DiscordEvent.SHARD_READY)
	async handleShardReady(id: number) {
		console.log(id, 'READY');
	}
}
