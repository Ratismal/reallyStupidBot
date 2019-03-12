<template>
	<main class='container'>
		<user-greeter class='user-greeter'/>
		<little-bois class='littlebois'/>
	</main>
</template>

<script>
import UserGreeter from '~/components/UserGreeter.vue';
import LittleBois from '~/components/LittleBois.vue';

export default {
	components: { UserGreeter, LittleBois },
	layout: 'custom',
	data() {
		return {};
	},
	mounted() {
		this.$ws.connect();
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
}

.littlebois {
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
