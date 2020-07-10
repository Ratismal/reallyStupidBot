<template>
	<main class='container'>
		<user-greeter class='user-greeter' v-if="!elements.greeter.hide" :style="elements.greeter.style"/>
		<little-bois class='littlebois' v-if="!elements.littlebois.hide" :style="elements.littlebois.style"/>
		<audio-bus/>
	</main>
</template>

<script>
import UserGreeter from '~/components/UserGreeter.vue';
import LittleBois from '~/components/LittleBois.vue';
import AudioBus from '~/components/AudioBus.vue';

export default {
	components: { UserGreeter, LittleBois, AudioBus },
	layout: 'custom',
	data() {
		return {
			state: 'IDLE',
			elements: {
				littlebois: {
					style: {
						top: null,
						right: null,
						bottom: 0,
						left: 0,
					},
					hide: false,
				},
				greeter: {
					style: {
						top: null,
						right: '2rem',
						bottom: 0,
						left: null,
					},
					hide: false,
				},
			},
			hide: {
				littlebois: false,
				greeter: false,
			},
			lbpos: 0,
			cbbottom: 0,
			cbright: '2rem',
		};
	},
	mounted() {
		if (this.$route.query.hide) {
			let toHide = this.$route.query.hide.split(',');
			for (const hide of toHide) {
				if (this.elements[hide]) this.elements[hide].hide = true;
			}
		}

		let directions = ['top', 'right', 'bottom', 'left'];
		if (this.$route.query.position) {
			let poses = this.$route.query.position.split('|');
			for (const pos of poses) {
				let [el, parts] = pos.split(':');
				if (this.elements[el]) {
					let coords = parts.split(',');
					for (let i = 0; i < directions.length; i++) {
						if (coords[i] !== '') {
							if (coords[i] === 'null') coords[i] = null;
							this.elements[el].style[directions[i]] = coords[i];
						}
					}
				}
			}
		}

		// if (this.$route.query.lbpos) {
		// 	this.lbpos = this.$route.query.lbpos;
		// }

		if (process.client) {
			this.$ws.connect();
		}
	},
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 0;

  font-family: sans-serif;
}

.user-greeter {
  position: absolute;
  bottom: 0;
  right: 2rem;
  margin: 1rem;

  z-index: 999;
}

.littlebois {
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
