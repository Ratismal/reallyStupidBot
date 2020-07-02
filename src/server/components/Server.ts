import {
	ComponentAPI,
	SubscribeEvent,
	Variable,
	Component,
	Plugin,
	VariableDefinitionType,
	Inject,
} from '@ayana/bento';

import Loggr from '$loggr';
const console = Loggr.get('Server');
import { Twitch } from './Twitch';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as websocketify from 'koa-websocket';
import * as bodyParser from 'koa-bodyparser';
import { CronJob } from 'cron';

import TwitchClient from 'twitch';

const snekfetch = require('snekfetch');

const nuxtConf: any = require('$root/../nuxt.config.js');
const { Nuxt, Builder } = require('nuxt');

import { Database } from '$plugins';
import { EventEmitter } from 'events';
import { WSEvent, TwitchChatEvent } from '../Constants';
import { PrivateMessage } from 'twitch-chat-client';

export class Server {
	public api: ComponentAPI;
	public name: string = 'Server';

	public dependencies: Component[] = [];
	public plugins: Plugin[] = [Database];

	private app: any;
	private router: Router;
	private nuxt: any;

	@Inject(Twitch)
	private Twitch: Twitch;
	private db: Database;
	private eventHandler: EventEmitter;

	public connections: any[] = [];

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	private pingInterval: CronJob;
	private chatters: { [name: string]: { date: number, timeout: any } } = {};

	public async onLoad() {
		this.pingInterval = new CronJob('*/15 * * * * *', this.wsPing.bind(this));
		this.pingInterval.start();
		this.eventHandler = new EventEmitter;

		this.app = websocketify(new Koa());
		this.router = new Router({ prefix: '/api' });

		this.app.use(bodyParser());

		// console.log(nuxtConf.dev, process.env.NODE_ENV);
		this.nuxt = new Nuxt(nuxtConf);
		if (nuxtConf.dev) {
			const builder = new Builder(this.nuxt);
			builder.build();
		}

		this.app.use(async (ctx: any, next: any) => {
			console.log(ctx.method, ctx.path);
			await next();
		});

		this.app.use(async (ctx: any, next: any) => {
			if (!ctx.path.startsWith('/api')) {
				return await (new Promise((res, rej) => {
					ctx.status = 200;
					ctx.res.on('close', res);
					ctx.res.on('finish', res);

					this.nuxt.render(ctx.req, ctx.res, (p: Promise<void>) => p.then(() => res()).catch(err => {
						console.log(err);
						rej();
					}));
				}));
			}
			return await next();
		});

		this.app.ws.use(async (ctx: any, next: any) => {
			console.log('Websocket connection opened.');
			ctx.websocket.state = null;
			ctx.websocket.sendMessage = function (msg: any) {
				ctx.websocket.send(JSON.stringify(msg));
			};
			this.connections.push(ctx.websocket);
			ctx.websocket.on('message', (msg: string) => {
				// console.log('Incoming message: ', msg);
				try {
					const obj = JSON.parse(msg);
					this.eventHandler.emit(obj.code, ctx.websocket, obj);
				} catch (err) {
					console.error(err);
				}
			});
			ctx.websocket.on('close', () => {
				console.log('Websocket connection closed.');
				this.connections.splice(this.connections.indexOf(ctx.websocket), 1);
			});
			ctx.websocket.sendMessage({
				code: 'HELLO',
				message: 'If you\'re reading this, you\'re gay. Please authenticate.',
			});
			await next();
		});

		this.router.post('/discord/auth', this.discordLogin.bind(this));
		this.router.post('/twitch/auth', this.twitchLogin.bind(this));
		this.app.use(this.router.routes()).use(this.router.allowedMethods());

		this.api.forwardEvents(this.eventHandler, Object.values(WSEvent));

		this.app.listen(3005);
		console.init('Listening on port 3005');
	}

	async wsBroadcast(msg: any) {
		for (const ws of this.connections) {
			ws.sendMessage(msg);
		}
	}

	async wsPing() {
		const state = Date.now();
		for (const ws of this.connections) {
			if (ws.state !== null) {
				ws.sendMessage({
					code: 'GOODBYE',
					message: 'Missed a ping',
				});
				ws.close();
				return;
			}
			ws.state = state;
			ws.sendMessage({
				code: 'PING',
				state,
			});
		}
	}

	@SubscribeEvent(Server, WSEvent.PONG)
	handleWsPing(ws: any, obj: any) {
		if (ws.state === obj.state) {
			ws.state = null;
		} else {
			ws.sendMessage({
				code: 'GOODBYE',
				message: 'Invalid ping response',
			});
			ws.close();
		}
	}

	async discordLogin(ctx: any, next: any) {

	}

	async twitchLogin(ctx: any, next: any) {
		const body = ctx.request.body;
		let res = await snekfetch.post(`https://id.twitch.tv/oauth2/token?client_id=${this.config.twitch.clientId}&client_secret=${this.config.twitch.clientSecret}&code=${body.code}&grant_type=authorization_code&redirect_uri=${this.config.origin}/twitch/login`);
		console.log(res.body);

		const client = TwitchClient.withCredentials(this.config.twitch.clientId, res.body.access_token);
		const user = await client.helix.users.getMe();

		await this.db.auth.upsert({
			id: user.id,
			name: user.name,
			accessToken: res.body.access_token,
			refreshToken: res.body.refresh_token,
		});

		if (user.id === this.config.twitch.myId) {
			await this.Twitch.login();
		}

		ctx.status = 200;
	}

	public async onUnload() {
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.PRIVMSG)
	async handleMessage(channel: string, user: string, message: string, msg: PrivateMessage) {
		if (channel !== '#reallystupidcat') return;

		if (!this.chatters[user]) {
			this.chatters[user] = { date: 0, timeout: null };
		}
		// console.log(Date.now() - this.chatters[user], channel, user);
		// check if it has been 15 minutes since last message
		if (Date.now() - this.chatters[user].date >= 1000 * 60 * 15) {
			await this.wsBroadcast({
				code: 'WELCOME',
				name: user,
				color: msg.userInfo.color,
			});
		}

		if (this.chatters[user].timeout) clearTimeout(this.chatters[user].timeout);
		this.chatters[user].timeout = setTimeout(async () => {
			await this.wsBroadcast({
				code: 'FAREWELL',
				name: user,
			});
		}, 15 * 60 * 1000);
		this.chatters[user].date = Date.now();

		await this.wsBroadcast({
			code: 'MESSAGE',
			name: user,
			text: message,
			color: msg.userInfo.color,
		});
	}

}
