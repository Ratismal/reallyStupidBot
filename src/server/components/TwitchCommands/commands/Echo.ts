import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchCommands } from '../Commands';
import { Command, CommandContext } from '../interfaces';

import Loggr from '$loggr';
const console = Loggr.get('TC: Echo');

export class Echo implements Command {
	public api: ComponentAPI;
	public name: string = 'Echo';

	public parent: Component = TwitchCommands;

	public command: string = 'echo';

	public aliases: string[] = ['say'];

	public description: string = 'repeats what you said';

	public async execute(ctx: CommandContext) {
		return '\u200b' + ctx.args.join(' ');
	}
}