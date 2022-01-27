import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchRedemptions } from '../Redemptions';
import { Redemption, RedemptionContext } from '../interfaces';

import Loggr from '$loggr';
const console = Loggr.get('TR: Read');

export class Read implements Redemption {
	public api: ComponentAPI;
	public name: string = 'read';
	public playSound = true;

	public parent: Component = TwitchRedemptions;

	public async execute(ctx: RedemptionContext) {
		console.log('aaaaaaa');
		ctx.Twitch.readText(ctx.message.message);
	}
}