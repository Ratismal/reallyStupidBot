import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchCommands } from '../Commands';
import { Command, CommandContext } from '../interfaces';

import Loggr from '$loggr';
const console = Loggr.get('TC: Dab');

export class Dab implements Command {
	public api: ComponentAPI;
	public name: string = 'Dab';

	public parent: Component = TwitchCommands;

	public command: string = 'dab';

	public description: string = 'dabs';

	public async execute(ctx: CommandContext) {
		return `${ctx.user} furiously dabs.`;
	}
}