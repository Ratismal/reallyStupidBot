<template>
	<div class='cache' v-if="cache">
		<img v-for="state in allStates" :key="state.src" :src="state.src">
	</div>
	<img class='greeter-sprite' v-else-if="current" :src="current.src">
</template>

<script>
import Sprite from '~/mixins/Sprite';

export default {
	mixins: [Sprite],
	data() {
		return {
			states: {
				IDLE: [
					{src: '/img/catbot/idle1.gif', duration: 3200},
					{src: '/img/catbot/idle2.gif', duration: 3200},
				],
				LEFT: [{src: '/img/catbot/left.gif', duration: 400}],
				RIGHT: [{src: '/img/catbot/right.gif', duration: 400}],
				ACTIVE: [{src: '/img/catbot/active.gif', duration: 200}],
			},
		};
	},
};
</script>

<style lang="scss" scoped>
.sprite {
	height: 100%;
	width: 100%;
}
</style>