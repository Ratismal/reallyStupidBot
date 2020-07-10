import { Component } from '@ayana/bento';
import { RedemptionContext } from './RedemptionContext';

export interface Redemption extends Component {
	name: string;
	aliases?: string[];
	playSound: boolean;
	execute(arg?: RedemptionContext): Promise<void | string>;
	validate?(arg?: RedemptionContext): Promise<boolean>;
}