import { Component } from '@ayana/bento';
import { CommandContext } from './CommandContext';

export interface Command extends Component {
	command: string;
	usage?: string;
	description?: string;
	aliases?: string[];
	execute(arg?: CommandContext): Promise<void | string>;
	validate?(arg?: CommandContext): Promise<boolean>;
}