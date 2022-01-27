import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchRedemptions } from '../Redemptions';
import { Redemption, RedemptionContext } from '../interfaces';

import Loggr from '$loggr';
const console = Loggr.get('TR: Echo');

export class Dab implements Redemption {
	public api: ComponentAPI;
	public name: string = 'read';
	public playSound = true;

	public parent: Component = TwitchRedemptions;

	public async execute(ctx: RedemptionContext) {
		ctx.Twitch.readText(ctx.message.message);
	}
}