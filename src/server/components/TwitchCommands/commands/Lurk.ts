import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchCommands } from '../Commands';
import { Command, CommandContext } from '../interfaces';

export class Lurk implements Command {
	public api: ComponentAPI;
	public name: string = 'Lurk';

	public parent: Component = TwitchCommands;

	public command: string = 'lurk';

	public description: string = 'Go into lurkmode.';

	public async execute(ctx: CommandContext) {
		return `${ctx.user} steps into the shadows...`;
	}
}