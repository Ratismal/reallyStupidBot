import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchCommands } from '../Commands';
import { Command, CommandContext } from '../interfaces';

import Loggr from '$loggr';
const console = Loggr.get('TC: Ping');

export class Ping implements Command {
	public api: ComponentAPI;
	public name: string = 'Ping';

	public parent: Component = TwitchCommands;

	public command: string = 'ping';

	public async execute(ctx: CommandContext) {
		return 'Pong!';
	}
}