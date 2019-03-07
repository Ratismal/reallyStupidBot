import {
	Component,
	ComponentAPI,
	FSComponentLoader,
	SubscribeEvent,
	Variable,
	VariableDefinitionType,
} from '@ayana/bento';

import { Client, Message, TextChannel } from 'eris';

import { DiscordEvent } from '../Constants';
import { Discord } from './Discord';
import { Command, CommandExecute } from './interfaces';

import Loggr from 'loggr';
const console = Loggr.get('CommandHandler');

export class CommandHandler {
	public api: ComponentAPI;
	public name: string = 'CommandHandler';

	@Variable({ type: VariableDefinitionType.STRING, name: 'prefix' })
	private prefix: string;

	public async onLoad() {
	}

	public async onChildLoad(command: Command) {
	}

	public async onChildUnload(command: Command) {
	}
}
