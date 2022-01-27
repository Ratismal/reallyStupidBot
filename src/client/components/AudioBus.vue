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
		this.$ws.on('READ_TEXT', this.readText.bind(this));
	},
	beforeDestroy() {
		this.$ws.removeListener('PLAY_AUDIO', this.playSound.bind(this));
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
		readText({text}) {
			console.log(text);
			const msg = new SpeechSynthesisUtterance();
			msg.text = text;
			window.speechSynthesis.speak(text);
		},
	},
};
</script>