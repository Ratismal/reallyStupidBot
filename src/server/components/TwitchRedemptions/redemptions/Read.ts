import { Component, ComponentAPI } from '@ayana/bento';

import { TwitchRedemptions } from '../Redemptions';
import { Redemption, RedemptionContext } from '../interfaces';

import * as googleTTS from 'google-tts-api';

import Loggr from '$loggr';
const console = Loggr.get('TR: Read');

export class Read implements Redemption {
	public api: ComponentAPI;
	public name: string = 'read';
	public playSound = true;

	public parent: Component = TwitchRedemptions;

	public async execute(ctx: RedemptionContext) {
		const base64 = await googleTTS.getAllAudioBase64(ctx.message.message, {
			lang: 'en',
			slow: false,
			host: 'https://translate.google.com'
		});

		setTimeout(() => {
			ctx.Twitch.playAudioFile(base64.map(b => `data:audio/mp3;base64,${b.base64}`));
		}, 3000);
	}
}