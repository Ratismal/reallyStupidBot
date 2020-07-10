import { Database } from '$plugins';
import { Twitch } from '../Twitch';
import { PrivateMessage } from 'twitch-chat-client';
import { Redemption, RedemptionContext } from './interfaces';

import {
	ComponentAPI,
	Component,
	Plugin,
	SubscribeEvent,
	Variable,
	VariableDefinitionType,
	FSComponentLoader,
	Inject
} from '@ayana/bento';

import Loggr from '$loggr';
import { PubSubEvent } from '$server';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client/lib';
const console = Loggr.get('TwitchRedemptions');

export class TwitchRedemptions {
	public api: ComponentAPI;
	public name: string = 'TwitchRedemptions';

	public dependencies: Component[] = [];
	public plugins: Plugin[] = [Database];

	private prefix: string;
	public redemptions: Map<string, Redemption> = new Map();
	private db: Database;

	@Inject(Twitch)
	private Twitch: Twitch;

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	public async onLoad() {
		this.prefix = this.config.twitch.prefix || '!';

		await this.api.loadComponents(FSComponentLoader, __dirname, 'redemptions');
	}

	public async onChildLoad(redemption: Redemption) {
		try {
			await this.addRedemption(redemption);
		} catch (err) {
			console.error(err);
		}
	}

	public async onChildUnload(redemption: Redemption) {
		try {
			await this.removeRedemption(redemption);
		} catch (err) {
			console.error(err);
		}
	}

	public async addRedemption(redemption: Redemption) {
		if (this.redemptions.has(redemption.name)) {
			throw new Error('Redemption already exists');
		}

		const name = redemption.name.toLowerCase();
		console.init('Registered redemption', redemption.name);
		this.redemptions.set(name, redemption);

		if (redemption.aliases) {
			for (const alias of redemption.aliases) {
				const lowerAlias = alias.toLowerCase();
				if (this.redemptions.has(lowerAlias)) throw new Error('Redemption alias already exists');
				this.redemptions.set(lowerAlias, redemption);
			}
		}
	}

	public async removeRedemption(redemption: Redemption) {
		const name = redemption.name.toLowerCase();
		if (this.redemptions.has(name)) {
			this.redemptions.delete(name);

			if (redemption.aliases) {
				for (const alias of redemption.aliases) {
					const lowerAlias = alias.toLowerCase();
					if (this.redemptions.has(lowerAlias)) this.redemptions.delete(lowerAlias);
				}
			}
		}
	}

	private filterName(name: string): string {
		return name.replace(/\s+/g, '_').replace(/[^a-z_]/gi, '').toLowerCase();
	}

	@SubscribeEvent(Twitch, PubSubEvent.REDEMPTION)
	private async handleMessage(message: PubSubRedemptionMessage) {
		const ctx: RedemptionContext = {
			message,
			client: this.Twitch.chatClient,
			twitch: this.Twitch.client,
			Twitch: this.Twitch,
		};

		const name = this.filterName(message.rewardName);

		if (!this.redemptions.has(name)) {
			this.Twitch.playAudio('redemption', name);
			return;
		}

		const c = this.redemptions.get(name);
		if (c.playSound) {
			this.Twitch.playAudio('redemption', name);
		}

		try {
			if (!c.validate || await c.validate(ctx)) {
				const res: void | string = await c.execute(ctx);
				if (typeof res === 'string') {
					const channel = await message.getChannel();
					await ctx.client.say(`#${channel.name}`, res);
				}
			}
		} catch (err) {
			console.error(err);
		}
	}
}
