import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchCommands } from '../Commands';
import { Command, CommandContext } from '../interfaces';

import Loggr from '$loggr';
const console = Loggr.get('TC: Help');

export class Help implements Command {
	public api: ComponentAPI;
	public name: string = 'Help';

	public parent: Component = TwitchCommands;

	public command: string = 'help';

	public aliases: string[] = ['commands'];

	public description: string = 'gets a list of commands, or info about a specific command';

	public async execute(ctx: CommandContext) {
		const tc = this.api.getComponent<TwitchCommands>(TwitchCommands);
		if (ctx.args.length > 0) {
			const command = tc.commands.get(ctx.args[0].toLowerCase());
			if (command) {
				return `${command.command}: ${command.description || 'no description provided.'}`;
			} else return `No command found with name: '${ctx.args[0].toLowerCase()}'`;
		} else {
			const commands = Array.from(tc.commands.entries()).filter(entry => {
				let [name, command]: [string, Command] = entry;
				return command.command === name;
			}).map(entry => entry[1].command);
			return 'Commands: ' + commands.join(', ');
		}
	}
}