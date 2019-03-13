import TwitchClient, { AccessToken, PrivilegedUser } from 'twitch';
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

import { CronJob } from 'cron';
import { Discord } from './Discord';

// import { EventEmitter } from 'events';
const console = Loggr.get('Twitch');

export class Twitch {
	public api: ComponentAPI;
	public name: string = 'Twitch';

	public dependencies: Component[] = [Discord];
	public plugins: Plugin[] = [Database];

	private db: Database;

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	public chatClient: ChatClient;
	public client: TwitchClient;
	private eventHandler: EventEmitter;

	public events: { [key: string]: any };

	private cron: CronJob;
	private isLive: boolean = false;
	public user: PrivilegedUser;

	public discord: Discord;

	public async onLoad() {
		this.discord = this.api.getComponent<Discord>(Discord);
		this.db = this.api.getPlugin<Database>(Database);
		this.events = {};

		this.eventHandler = new EventEmitter();

		this.api.forwardEvents(this.eventHandler, Object.values(TwitchChatEvent));

		await this.login();

		this.cron = new CronJob('* * * * *', this.cronInterval.bind(this));
		this.cron.start();
	}

	public async cronInterval() {
		const live = await this.isStreamLive();
		// console.log('Ping! Stream is', live ? 'online' : 'offline', '. It was', this.isLive ? 'online' : 'offline');
		if (live === null) return;
		if (live && !this.isLive) {
			this.isLive = true;
			this.eventHandler.emit('STREAM_UP');
		} else if (!live && this.isLive) {
			this.isLive = false;
			this.eventHandler.emit('STREAM_DOWN');
		}
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
				this.user = user;
				console.init('Logged in as', user.displayName);

				console.init('Loading chat...');
				this.chatClient = new ChatClient('reallystupidbot', this.config.twitch.chatToken, this.client);
				console.init('Loading events...');
				await this.registerEvents();

				// this.api.forwardEvents(this.cclient, Object.values(this.events));
				console.init('Connecting...');
				await this.chatClient.connect();
				console.init('Waiting for registration...');
				await this.chatClient.waitForRegistration();
				console.init('Joining channel...');
				await this.chatClient.join(user.displayName);

				// First ping, don't perform announcement
				if (await this.isStreamLive()) {
					this.isLive = true;
				} else this.isLive = false;
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
		for (const key in this.chatClient) {
			if (key.startsWith('on')) {
				let eventName = key.substring(2);
				if (eventName.length > 0) {
					// SNAKE_CASE event names
					eventName = eventName.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
					this.events[eventName] = (this.chatClient as any)[key];
					const handler = (this.chatClient as any)[key]((...args: any[]) => {
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

	public async isStreamLive() {
		if (this.client) {
			const stream = await this.client.streams.getStreamByChannel(this.config.twitch.myId);
			// console.log(stream);
			// if (stream !== null)
			// 	this.eventHandler.emit('STREAM_UP');

			return stream !== null;
		} else return null;
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.STREAM_UP)
	async handleStreamUp() {
		console.info('Stream is now live.');
		console.log(this.user.displayName);
		await this.chatClient.say('#' + this.user.name, `${this.user.displayName} is now live!`);

		let client = this.discord.client;

		const { guildId, roleId, channelId } = this.config.discord;

		await client.editRole(guildId, roleId, {
			mentionable: true,
		}, 'stream announcement');

		await client.createMessage(channelId, `<@&${roleId}> stupid cat is now live! https://twitch.tv/reallystupidcat`);

		await client.editRole(guildId, roleId, {
			mentionable: false,
		}, 'stream announcement');
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.STREAM_DOWN)
	async handleStreamDown() {
		console.info('Stream is no longer live.');
		console.log(this.user.displayName);
		await this.chatClient.say('#' + this.user.name, `${this.user.displayName} is now offline!`);
	}

}
