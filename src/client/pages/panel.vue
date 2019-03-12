<template>
	<main class='container'>
		<user-greeter class='user-greeter'/>
	</main>
</template>

<script>
import UserGreeter from '~/components/UserGreeter.vue';

export default {
	components: { UserGreeter },
	layout: 'custom',
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
</style>
