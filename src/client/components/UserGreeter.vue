<template>
	<div class='greeter-wrapper catflex vert-align'>
		<greeter-sprite :cache="true"/>
		<div class='icon'>
			<greeter-sprite :state="state" class='catbot'/>
		</div>
		<div :class='messageClass'>
			<span class='message-text' v-if="current">
				{{current.text}}
			</span>
		</div>
	</div>
</template>

<script>
import GreeterSprite from '~/components/GreeterSprite.vue';

export default {
	components: {GreeterSprite},
	data() {
		return {
			queue: [],
			state: 'IDLE',
		};
	},
	watch: {

	},
	computed: {
		imagePath() {
			return '/img/catbot/' + this.image;
		},
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
				'text-hidden': this.state !== 'ACTIVE',
				catflex: true,
				'vert-align': true,
			};
		},
	},
	beforeDestroy() {
		this.$ws.removeListener('WELCOME', this.welcomeUser.bind(this));
	},
	mounted() {
		if (process.client) {
			this.$ws.on('WELCOME', this.welcomeUser.bind(this));
			this.state = 'IDLE';

			// this.welcomeUser({ name: 'antidisestablishmentarianism' });
			// // this.welcomeUser({ name: 'aaaa' });
			// // this.welcomeUser({ name: 'aaaa' });
			// // this.welcomeUser({ name: 'aaaa' });
			// const names = [
			// 	'Alice',
			// 	'Bob',
			// 	'Carol',
			// 	'Danny',
			// 	'Ella',
			// 	'Fred',
			// 	'George',
			// 	'Harold',
			// ];
			// setInterval(() => {
			// 	let name = names[Math.floor(Math.random() * names.length)];
			// 	this.welcomeUser({ name });
			// }, 25000);
		}
	},
	methods: {
		sleep(time = 5000) {
			return new Promise(res => setTimeout(res, time));
		},
		async welcomeUser(msg) {
			let entry;
			const p = new Promise(async res => {
				entry = {
					name: msg.name,
					res,
					displayed: false,
					text: `Welcome, ${msg.name}!`,
				};
			});
			this.queue.push(entry);
			if (this.queue.length > 1) {
				await p;
			}
			entry.displayed = true;
			this.state = 'LEFT';
			await this.sleep(1000);
			this.state = 'ACTIVE';
			await this.sleep(5000);
			entry.displayed = false;
			this.state = 'RIGHT';
			await this.sleep(1000);
			this.queue.shift();
			if (this.queue[0]) this.queue[0].res();
			else this.state = 'IDLE';
		},
	},
};
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=Press+Start+2P");

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
  background-image: url("/img/catbot/bubble.png");
  background-size: cover;
  color: rgba(0, 0, 0, 1);
  opacity: 1;
  transition: width 1s ease-in-out, opacity 0.5s;

  .message-text {
    box-sizing: border-box;
    display: block;
    width: 375px;
    margin: 0 1rem;
    text-align: center;
    // word-wrap: none;
    padding: 0 10px;
    // white-space: nowrap;
    font-size: 1.1em;
    font-family: "Press Start 2P", monospace;
    // word-break: break-all;
    overflow-wrap: break-word;
    word-wrap: break-word;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    -moz-hyphens: auto;
    hyphens: auto;
  }

  &.hidden {
    width: 0px;
  }

  &.text-hidden {
    opacity: 0;
  }
}

.icon {
  height: 100px;
  width: 100px;
  // background: black;
  color: white;

  .catbot {
    width: 100%;
    height: 100%;
  }
}
</style>
