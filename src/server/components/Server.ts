import {
	ComponentAPI,
	SubscribeEvent,
	Variable,
	Component,
	VariableDefinitionType,
} from '@ayana/bento';

import Loggr from 'loggr';
const console = Loggr.get('Server');
import { Twitch } from './Twitch';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';

export class Server {
	public api: ComponentAPI;
	public name: string = 'Server';

	public dependencies: Component[] = [Twitch];

	private app: Koa;
	private router: Router;

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	public async onLoad() {
		this.app = new Koa();
		this.router = new Router();

		this.app.use(bodyParser());

		this.app.use(async (ctx: any, next: any) => {
			console.log(ctx.method, ctx.path);
			await next();
		});
	}

	public async onUnload() {
	}

}
