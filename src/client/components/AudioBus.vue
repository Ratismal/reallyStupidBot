<template>
	<div>
	</div>
</template>

<script>
import manifest from '@/assets/json/audio.json';

export default {
	data() {
		return {
			manifest,
			audio: {},
			files: [],
			currentlyPlaying: false,
		};
	},
	mounted() {
		for (const categoryKey of Object.keys(this.manifest)) {
			this.audio[categoryKey] = {};
			const category = this.manifest[categoryKey];
			for (const entryKey of Object.keys(category)) {
				const url = '/sfx/' + category[entryKey];
				this.audio[categoryKey][entryKey] = new Audio(url);
			}
		}

		this.$ws.on('PLAY_AUDIO', this.playSound.bind(this));
		this.$ws.on('PLAY_AUDIO_FILE', this.playAudioFile.bind(this));
	},
	beforeDestroy() {
		this.$ws.removeListener('PLAY_AUDIO', this.playSound.bind(this));
		this.$ws.removeListener('PLAY_AUDIO_FILE', this.playAudioFile.bind(this));
	},
	methods: {
		playSound({category, name}) {
			console.log(category, name);
			if (this.audio[category]) {
				let audio;
				if (this.audio[category][name])
					audio = this.audio[category][name];
				else
					audio = this.audio[category].default;
				if (!audio) return;

				audio.play();
			}
		},
		async playAudioFile({urls}) {
			this.files.push(...urls, 'PAUSE');

			if (!this.currentlyPlaying) {
				this.currentlyPlaying = true;
				while (this.files.length > 0) {
					await new Promise(res => {
						const url = this.files.shift();
						if (url === 'PAUSE') {
							return setTimeout(res, 3000);
						}
						console.log(url);
						const audio = new Audio(url);
						audio.addEventListener('ended', res);
						audio.play();
					});
				}
				this.currentlyPlaying = false;
			}
		},
	},
};
</script>