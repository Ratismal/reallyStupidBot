import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchRedemptions } from '../Redemptions';
import { Redemption, RedemptionContext } from '../interfaces';

import Loggr from '$loggr';
import { WSEvent } from '$server';

const navi = ['hello', 'hey', 'listen', 'look', 'scream', 'watch out'];

const console = Loggr.get('TR: Listen');

export class Listen implements Redemption {
	public api: ComponentAPI;
	public name: string = 'hey_listen';
	public playSound = false;

	public parent: Component = TwitchRedemptions;

	public async execute(ctx: RedemptionContext) {
		let name = (ctx.message.message || '').toLowerCase();
		if (!navi.includes(name)) {
			name = navi[Math.floor(Math.random() * navi.length)];
		}
		ctx.Twitch.playAudio('navi', name);
	}
}