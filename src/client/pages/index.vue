<template>
	<main>
		<section>
			<h1>super cool page</h1>
			<p>for super cool stuff</p>

			<div class='catflex vertical'>
				<div v-for="(message, i) in messages" :key="i">
					{{JSON.stringify(message)}}
				</div>
			</div>
		</section>
	</main>
</template>

<script>
export default {
	data() {
		return {
			messages: [],
		};
	},
	mounted() {
		if (process.client) {
			this.$ws.connect();

			this.$ws.on('PING', this.handlePing.bind(this));
			this.$ws.on('message', this.handleMsg.bind(this));
		}
	},
	methods: {
		handleMsg(msg) {
			this.messages.push(msg);
		},
		handlePing(msg) {
			this.$ws.sendMessage({
				code: 'PONG',
				state: msg.state,
			});
		},
	},
};
</script>
