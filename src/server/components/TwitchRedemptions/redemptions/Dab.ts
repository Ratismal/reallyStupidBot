import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchRedemptions } from '../Redemptions';
import { Redemption, RedemptionContext } from '../interfaces';

import Loggr from '$loggr';
const console = Loggr.get('TR: Dab');

export class Dab implements Redemption {
	public api: ComponentAPI;
	public name: string = 'dab';
	public playSound = true;

	public parent: Component = TwitchRedemptions;

	public async execute(ctx: RedemptionContext) {
		return 'I can\'t believe you\'ve done this.';
	}
}