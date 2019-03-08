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

const nuxtConf: any = require('$root/../nuxt.config.js');
const { Nuxt, Builder } = require('nuxt');

export class Server {
	public api: ComponentAPI;
	public name: string = 'Server';

	public dependencies: Component[] = [Twitch];

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

		this.router.get('/discord/auth')
		this.app.use(this.router.routes()).use(this.router.allowedMethods());

		this.app.listen(3005);
	}

	async discordLogin(ctx: any, next: any) {

	}

	public async onUnload() {
	}

}
