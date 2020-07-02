import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchCommands } from '../Commands';
import { Twitch } from '../../Twitch';
import { Command, CommandContext } from '../interfaces';

import Loggr from '$loggr';
const console = Loggr.get('TC: Shoutout');

export class ShoutOut implements Command {
	public api: ComponentAPI;
	public name: string = 'Shout Out';

	public parent: Component = TwitchCommands;

	public command: string = 'shoutout';
	public aliases: string[] = ['so'];

	public description: string = 'Give a user a shoutout.';

	public async validate(ctx: CommandContext): Promise<boolean> {
		return ctx.msg.userInfo.isMod || ctx.msg.userInfo.userId === ctx.Twitch.user.id;
	}

	public async execute(ctx: CommandContext) {
		let user = await ctx.twitch.kraken.users.getUserByName(ctx.args[0]);
		if (user) {
			let channel = await user.getChannel();
			return `If you like ${channel.game}, you should check out ${user.displayName}! https://twitch.tv/${user.name}`;
		} else {
			return `I don't know who that is, sorry ;w;`;
		}
	}
}