<template>
	<main class='container'>
		<user-greeter class='user-greeter' v-if="!hide.greeter"/>
		<little-bois class='littlebois' v-if="!hide.littlebois"/>
	</main>
</template>

<script>
import UserGreeter from '~/components/UserGreeter.vue';
import LittleBois from '~/components/LittleBois.vue';

export default {
	components: { UserGreeter, LittleBois},
	layout: 'custom',
	data() {
		return {
			state: 'IDLE',
			hide: {
				littlebois: false,
				greeter: false,
			},
		};
	},
	mounted() {
		if (this.$route.query.hide) {
			let toHide = this.$route.query.hide.split(',');
			for (const hide of toHide) {
				if (this.hide[hide] !== undefined) this.hide[hide] = true;
			}
		}

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
