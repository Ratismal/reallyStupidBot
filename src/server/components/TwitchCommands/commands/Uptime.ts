import { Component, ComponentAPI, SubscribeEvent, VariableDefinitionType, Variable } from '@ayana/bento';

import { TwitchCommands } from '../Commands';
import { Twitch } from '../../Twitch';
import { Command, CommandContext } from '../interfaces';

import * as moment from 'moment';

import Loggr from '$loggr';
import { TwitchChatEvent } from '../../../Constants';
import start from '$server';
const console = Loggr.get('TC: Uptime');

export class Uptime implements Command {
	public api: ComponentAPI;
	public name: string = 'Uptime';

	public parent: Component = TwitchCommands;
	public dependencies: Component[] = [Twitch];

	public command: string = 'uptime';

	public description: string = 'Gets the uptime of the stream.';
	public startDate: any;

	@Variable({ type: VariableDefinitionType.OBJECT, name: '_config' })
	private config: { [key: string]: any };

	public async execute(ctx: CommandContext) {
		if (!this.startDate) {
			let twitch = this.api.getComponent<Twitch>(Twitch);
			const stream = await twitch.client.helix.streams.getStreamByUserId(this.config.twitch.myId)
			if (!stream) {
				return 'The stream is offline right now.';
			}
			this.startDate = moment(stream.startDate);
		}

		let diff = moment.duration(Date.now() - this.startDate);
		return `The stream has been live for ${diff.hours()}:${diff.minutes().toString().padStart(2, '0')}:${diff.seconds().toString().padStart(2, '0')}.`;
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.STREAM_UP)
	async handleStreamUp() {
		this.startDate = moment();
	}

	@SubscribeEvent(Twitch, TwitchChatEvent.STREAM_DOWN)
	async handleStreamDown() {
		this.startDate = null;
	}




}