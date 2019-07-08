import { Component, ComponentAPI, Plugin } from '@ayana/bento';
import { Database } from '$plugins';

import { TwitchCommands } from '../Commands';
import { Command, CommandContext } from '../interfaces';

import Loggr from '$loggr';
const console = Loggr.get('TC: Pixel');

export class Pixel implements Command {
	public api: ComponentAPI;
	public name: string = 'Pixel';

	public parent: Component = TwitchCommands;
	public plugins: Plugin[] = [Database];

	public command: string = 'pixel';
	public db: Database;

	public aliases: string[] = [];

	public description: string = 'creates fantastic art';

	public async onLoad() {

	}

	public async execute(ctx: CommandContext) {
		return '\u200b' + ctx.args.join(' ');
	}
}