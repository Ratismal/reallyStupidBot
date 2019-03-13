<template>
	<div class='cache' v-if="cache">
		<img v-for="state in allStates" :key="state.src" :src="state.src">
	</div>
	<img class='littleboi-sprite' v-else-if="current" :src="current.src">
</template>

<script>
import Sprite from '~/mixins/Sprite';

export default {
	mixins: [Sprite],
	data() {
		return {
			states: {
				IDLE: [{src: '/img/littleboi/idle1.gif', duration: 3200}],
				WALK: [{src: '/img/littleboi/walk.gif', duration: 800}],
			},
		};
	},
};
</script>