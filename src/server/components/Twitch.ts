import TwitchClient, { AccessToken } from 'twitch';
import ChatClient from 'twitch-chat-client';
import { Database } from '$plugins';
import { TwitchChatEvent } from '$server';
import {
	ComponentAPI,
	Component,
	Plugin,
	SubscribeEvent,
	Variable,
	VariableDefinitionType,
} from '@ayana/bento';

import Loggr from '$loggr';
import { EventEmitter } from 'events';
// import { EventEmitter } from 'events';
const console = Loggr.get('Twitch');

export class Twitch {
	public api: ComponentAPI;
	public name: string = 'Twitch';

	public plugins: Plugin[] = [Database];

	private db: Database;

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	private cclient: ChatClient;
	private client: TwitchClient;
	private eventHandler: EventEmitter;

	public events: { [key: string]: any };

	public async onLoad() {
		this.db = this.api.getPlugin<Database>(Database);
		this.events = {};

		this.eventHandler = new EventEmitter();

		this.api.forwardEvents(this.eventHandler, Object.values(TwitchChatEvent));

		await this.login();
	}

	public async onUnload() {
	}

	private refresh(id: string): (token: AccessToken) => void {
		return async function refreshToken(token: AccessToken) {
			const auth = await this.db.auth.findByPk(id);
			auth.set('accessToken', token);
			await auth.save();
		};
	}

	public async login() {
		try {
			// retrieve oauth tokens for the connection with myself
			const auth = await this.db.auth.findByPk(this.config.twitch.myId);
			if (auth) {
				// create a client
				this.client = TwitchClient.withCredentials(this.config.twitch.clientId, auth.get('accessToken'), {
					clientSecret: this.config.twitch.clientSecret,
					refreshToken: auth.get('refreshToken'),
					onRefresh: this.refresh(auth.id),
				});

				// test login
				const user = await this.client.users.getMe();
				console.init('Logged in as', user.displayName);

				console.init('Loading chat...');
				this.cclient = await ChatClient.forTwitchClient(this.client);
				console.init('Loading events...');
				await this.registerEvents();

				// this.api.forwardEvents(this.cclient, Object.values(this.events));
				console.init('Connecting...');
				await this.cclient.connect();
				console.init('Waiting for registration...');
				await this.cclient.waitForRegistration();
				console.init('Joining channel...');
				await this.cclient.join(user.displayName);
			} else {
				console.error('No authentication was found.');
			}
		} catch (err) {
			console.error('Authentication failed.');
			console.error(err);
		}
	}

	private async registerEvents() {
		this.events = {};
		for (const key in this.cclient) {
			if (key.startsWith('on')) {
				let eventName = key.substring(2);
				if (eventName.length > 0) {
					// SNAKE_CASE event names
					eventName = eventName.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
					this.events[eventName] = (this.cclient as any)[key];
					const handler = (this.cclient as any)[key]((...args: any[]) => {
						this.eventHandler.emit(eventName, ...args);
					});
					// this.eventHandler.on(eventName);
					// console.init('Registered twitch event', eventName);
				}
			}
		}
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.NOTICE)
	async handleNotice(...args: any[]) {
		console.log(args);
	}

}
