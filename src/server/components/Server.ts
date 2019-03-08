import {
	ComponentAPI,
	SubscribeEvent,
	Variable,
	Component,
	VariableDefinitionType,
} from '@ayana/bento';

import Loggr from '$loggr';
const console = Loggr.get('Server');
import { Twitch } from './Twitch';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';

import TwitchClient from 'twitch';

const snekfetch = require('snekfetch');

const nuxtConf: any = require('$root/../nuxt.config.js');
const { Nuxt, Builder } = require('nuxt');

import { Database } from '$plugins';

export class Server {
	public api: ComponentAPI;
	public name: string = 'Server';

	public dependencies: Component[] = [Twitch];
	public plugins: Component[] = [Database];

	private app: Koa;
	private router: Router;
	private nuxt: any;

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	public async onLoad() {
		this.app = new Koa();
		this.router = new Router({prefix: '/api'});

		this.app.use(bodyParser());

		console.log(nuxtConf.dev, process.env.NODE_ENV);
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
						rej()
					}));
				}));
			}
			return await next();
		});

		this.router.post('/discord/auth', this.discordLogin.bind(this));
		this.router.post('/twitch/auth', this.twitchLogin.bind(this));
		this.app.use(this.router.routes()).use(this.router.allowedMethods());

		this.app.listen(3005);
	}

	async discordLogin(ctx: any, next: any) {

	}

	async twitchLogin(ctx: any, next: any) {
		const body = ctx.request.body;
		let res = await snekfetch.post(`https://id.twitch.tv/oauth2/token?client_id=${this.config.twitch.clientId}&client_secret=${this.config.twitch.clientSecret}&code=${body.code}&grant_type=authorization_code&redirect_uri=${this.config.origin}/twitch/login`);
		console.log(res.body);

		const client = TwitchClient.withCredentials(this.config.twitch.clientId, res.body.access_token);
		const user = await client.users.getMe();

		const db = this.api.getPlugin<Database>(Database);

		await db.auth.upsert({
			id: user.id,
			name: user.name,
			accessToken: res.body.access_token,
			refreshToken: res.body.refresh_token
		});

		ctx.status = 200;
	}

	public async onUnload() {
	}

}
