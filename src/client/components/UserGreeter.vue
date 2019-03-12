<template>
	<div class='greeter-wrapper catflex vert-align'>
		<div class='icon'>{{state}}</div>
		<div :class='messageClass'>
			<span class='message-text' v-if="current">
				Welcome, {{current.name}}
			</span>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			queue: [],
			state: 'idle',
		};
	},
	computed: {
		current() {
			return this.queue[0];
		},
		iconClass() {
			let c = [];

			return c;
		},
		messageClass() {
			return {
				'message-wrapper': true,
				hidden: this.current ? !this.current.displayed : true,
				'text-hidden': this.state !== 'OPEN',
				catflex: true,
				'vert-align': true,
			};
		},
	},
	mounted() {
		if (process.client) {
			this.$ws.on('WELCOME', this.welcomeUser.bind(this));
		}

		this.welcomeUser({ name: 'aaaa' });
		// this.welcomeUser({ name: 'aaaa' });
		// this.welcomeUser({ name: 'aaaa' });
		// this.welcomeUser({ name: 'aaaa' });
		const names = [
			'Alice',
			'Bob',
			'Carol',
			'Danny',
			'Ella',
			'Fred',
			'George',
			'Harold',
		];
		setInterval(() => {
			let name = names[Math.floor(Math.random() * names.length)];
			this.welcomeUser({ name });
		}, 10000);
	},
	methods: {
		sleep(time = 5000) {
			return new Promise(res => setTimeout(res, time));
		},
		async welcomeUser(msg) {
			let entry;
			const p = new Promise(async res => {
				entry = { name: msg.name, res, displayed: false };
			});
			this.queue.push(entry);
			if (this.queue.length > 1) {
				await p;
			}
			entry.displayed = true;
			this.state = 'OPENING';
			await this.sleep(1000);
			this.state = 'OPEN';
			await this.sleep(5000);
			entry.displayed = false;
			this.state = 'CLOSING';
			await this.sleep(1000);
			this.queue.shift();
			if (this.queue[0]) this.queue[0].res();
			else this.state = 'IDLE';
		},
	},
};
</script>

<style lang="scss" scoped>
.greeter-wrapper {
  height: 100px;
  width: 450px;
  display: flex;
  justify-content: flex-end;
}

.message-wrapper {
  overflow: hidden;
  width: 375px;
  height: 100px;
  background: red;
  color: rgba(0, 0, 0, 1);
  transition: width 1s, color 0.5s;

  .message-text {
    box-sizing: border-box;
    display: block;
    width: 100%;
    text-align: center;
    word-wrap: none;
    padding: 1rem;
    white-space: nowrap;
    font-size: 1.3em;
  }

  &.hidden {
    width: 0px;
  }

  &.text-hidden {
    color: rgba(0, 0, 0, 0);
  }
}

.icon {
  height: 100px;
  width: 100px;
  background: black;
  color: white;
}
</style>
