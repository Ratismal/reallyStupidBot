import { Component } from '@ayana/bento';
import { CommandContext } from './CommandContext';

export interface Command extends Component {
	command: string;
	execute(arg?: CommandContext): Promise<void | string>;
}