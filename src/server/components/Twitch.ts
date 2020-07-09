import TwitchClient, {
	AccessToken,
	HelixUser,
	StaticAuthProvider,
	RefreshableAuthProvider,
} from 'twitch';
import ChatClient, { PrivateMessage, ChatRitualInfo } from 'twitch-chat-client';
import PubSubClient, { PubSubListener, PubSubRedemptionMessage, PubSubBitsMessage, PubSubSubscriptionMessage } from 'twitch-pubsub-client';
import { Database } from '$plugins';
import { TwitchChatEvent } from '$server';
import {
	ComponentAPI,
	Component,
	Plugin,
	SubscribeEvent,
	Variable,
	VariableDefinitionType,
	Inject,
} from '@ayana/bento';

import Loggr from '$loggr';
import { EventEmitter } from 'events';

import { CronJob } from 'cron';
import { Discord } from './Discord';
import UserNotice from 'twitch-chat-client/lib/Capabilities/TwitchCommandsCapability/MessageTypes/UserNotice';
import { PubSubEvent } from '../Constants';

const console = Loggr.get('Twitch');

const EVENT_MAP = {
	STREAM_DOWN: '🚮 **Stream Down**',
	USER_JOIN: '📥 **User Joined**',
	USER_PART: '📤 **User Parted**',
	RITUAL: '🃏 **Ritual**',
	REDEMPTION: '💮 **Redemption**',
	BITS: '✨ **Bits**',
}

export class Twitch {
	public api: ComponentAPI;
	public name: string = 'Twitch';

	public dependencies: Component[] = [Discord];
	public plugins: Plugin[] = [Database];

	private db: Database;

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	public chatClient: ChatClient;
	public pubSubClient: PubSubClient;
	public client: TwitchClient;
	private eventHandler: EventEmitter;

	public events: { [key: string]: any };

	private cron: CronJob;
	private relog: CronJob;
	private isLive: boolean = false;
	private avatarCache: { [key: string]: string };

	private pubSubListeners: PubSubListener[] = [];

	public user: HelixUser;

	@Inject(Discord)
	public discord: Discord;

	private authProvider: RefreshableAuthProvider;

	public async onLoad() {
		this.events = {};

		this.eventHandler = new EventEmitter();

		this.api.forwardEvents(this.eventHandler, [
			...Object.values(TwitchChatEvent),
			...Object.values(PubSubEvent)
		]);

		await this.login();

		this.cron = new CronJob('* * * * *', this.cronInterval.bind(this));
		this.cron.start();

		this.relog = new CronJob('*/15 * * * *', this.testLogin.bind(this));
		this.relog.start();

		this.avatarCache = {};
	}

	public async cronInterval() {
		const live = await this.isStreamLive();
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
		return async (token: AccessToken) => {
			console.init('Refreshing token...');
			const auth = await this.db.auth.findByPk(id);
			auth.set('accessToken', token.accessToken);
			auth.set('refreshToken', token.refreshToken);
			await auth.save();
		};
	}

	private async testLogin() {
		try {
			await this.client.helix.users.getMe();
		} catch (err) {
			console.warn('Refreshing authentication');
			await this.authProvider.refresh();
		}
	}

	public async login() {
		try {
			// retrieve oauth tokens for the connection with myself
			const auth = await this.db.auth.findByPk(this.config.twitch.myId);
			if (auth) {
				console.log(auth.dataValues);
				this.authProvider = new RefreshableAuthProvider(
					new StaticAuthProvider(this.config.twitch.clientId, auth.get('accessToken')), {
					clientSecret: this.config.twitch.clientSecret,
					refreshToken: auth.get('refreshToken'),
					onRefresh: this.refresh(auth.id),
				});
				// create a client
				this.client = TwitchClient.withCredentials(this.config.twitch.clientId, auth.get('accessToken'), undefined, {
					refreshToken: auth.get('refreshToken'),
					clientSecret: this.config.twitch.clientSecret,
					onRefresh: this.refresh(auth.id)
				});

				console.init('Testing login...');
				let user;
				// test login
				try {
					user = await this.client.helix.users.getMe();
				} catch (err) {
					await this.authProvider.refresh();
					console.warn('Failed. Trying again...');
					user = await this.client.helix.users.getMe();
				}
				this.user = user;
				console.init('Logged in as', user.displayName);

				if (this.chatClient) {
					this.chatClient.quit();
				}

				console.init('Loading chat...');
				this.chatClient = new ChatClient(this.client, {
					channels: [user.displayName],
					requestMembershipEvents: true
				});

				console.init('Loading pubsub...');
				this.pubSubClient = new PubSubClient();
				await this.pubSubClient.registerUserListener(this.client);
				this.registerPubSubListeners();

				console.init('Loading events...');
				await this.registerEvents();

				console.init('Connecting...');
				await this.chatClient.connect();

				// First ping, don't perform announcement
				this.isLive = await this.isStreamLive();
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

	private async registerPubSubListeners() {
		for (const listener of this.pubSubListeners) {
			listener.remove();
		}

		for (const key in PubSubEvent) {
			const eventFunc: string = (PubSubEvent as any)[key];
			console.init('Registering', eventFunc, 'listener...');
			const listener: PubSubListener = (this.pubSubClient as any)[eventFunc](this.user.id, (...args: any) => {
				console.info('PubSubEvent has been triggered:', eventFunc, args);
				this.eventHandler.emit(eventFunc, ...args);
			});
			this.pubSubListeners.push(listener);
		}
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.NOTICE)
	async handleNotice(...args: any[]) {
		console.log(args);
	}

	public async isStreamLive() {
		if (this.client) {
			const user = await this.client.helix.users.getUserById(this.config.twitch.myId);
			const stream = await user.getStream();
			return stream !== null;
		} else return null;
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.STREAM_UP)
	async handleStreamUp() {
		console.info('Stream is now live.');
		console.log(this.user.displayName);
		await this.chatClient.say('#' + this.user.name, `${this.user.displayName} is now live!`);

		let client = this.discord.client;

		const user = await this.client.helix.users.getUserById(this.config.twitch.myId);
		const stream = await user.getStream();
		const game = await stream.getGame();

		const { roleId, channelId } = this.config.discord;

		// wait 5 minutes to give twitch time to (hopefully) generate a preview
		setTimeout(async () => {
			await client.createMessage(channelId, {
				content: `<@&${roleId}> stupid cat is now live!`,
				embed: {
					title: stream.title,
					description: `We're doin' some **${game.name}**, come join us!\n\n<https://twitch.tv/${user.name}>`,
					image: {
						url: this.formatThumbnail(stream.thumbnailUrl, 1280, 720)
					},
					thumbnail: {
						url: this.formatThumbnail(game.boxArtUrl, 300, 300)
					}
				}
			});
		}, 5 * 60 * 1000);
	}

	formatThumbnail(url: string, width: number, height: number) {
		return url.replace('{width}', width.toString()).replace('{height}', height.toString());
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.STREAM_DOWN)
	async handleStreamDown() {
		console.info('Stream is no longer live.');
		console.log(this.user.displayName);
		this.chatClient.say('#' + this.user.name, `${this.user.displayName} is now offline!`);
		await this.logEvent(EVENT_MAP.STREAM_DOWN);
	}

	async logEvent(event: string, args: object = {}) {
		let client = this.discord.client;
		await client.createMessage(this.config.discord.eventChannelId, {
			content: `${event}\n` + Object.entries(args).map(entry => ` - ${entry[0]}: ${entry[1]}`).join('\n')
		});
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.JOIN)
	async handleJoin(channel: string, user: string) {
		await this.logEvent(EVENT_MAP.USER_JOIN, { user });
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.PART)
	async handlePart(channel: string, user: string) {
		await this.logEvent(EVENT_MAP.USER_PART, { user });
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.PRIVMSG)
	private async handleMessage(channel: string, user: string, message: string, msg: PrivateMessage) {
		let client = this.discord.client;

		let avatar = this.avatarCache[user];
		if (!avatar) {
			const tUser = await this.client.helix.users.getUserByName(user);
			avatar = tUser.profilePictureUrl;
			this.avatarCache[user] = avatar;
		}

		const webhook = this.config.discord.chatWebhook;
		client.executeWebhook(webhook.id, webhook.token, {
			content: message,
			username: msg.userInfo.userName,
			avatarURL: avatar
		});
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.RITUAL)
	private async handleRitual(channel: string, user: string, ritualInfo: ChatRitualInfo, msg: UserNotice) {
		await this.logEvent(EVENT_MAP.USER_PART, { user, ...ritualInfo });
	}

	@SubscribeEvent(Twitch, PubSubEvent.REDEMPTION)
	private async handleRedemption(message: PubSubRedemptionMessage) {
		await this.logEvent(EVENT_MAP.REDEMPTION, {
			user: message.userDisplayName,
			reward: message.rewardName,
			cost: message.rewardCost,
			prompt: message.rewardPrompt,
			message: message.message
		});
	}

	@SubscribeEvent(Twitch, PubSubEvent.BITS)
	private async handleBits(message: PubSubBitsMessage) {
		await this.logEvent(EVENT_MAP.BITS, {
			user: message.userName,
			bits: message.bits,
			total: message.totalBits,
		});
	}

	@SubscribeEvent(Twitch, PubSubEvent.SUBSCRIPTION)
	private async handleSub(message: PubSubSubscriptionMessage) {
		await this.logEvent(EVENT_MAP.BITS, {
			user: message.userDisplayName,
			gifter: message.gifterDisplayName,
			months: message.months,
			streak: message.streakMonths,
		});
	}
}
