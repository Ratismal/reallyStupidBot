<template>
	<div>
		<little-boi-sprite :cache="true" />

		<div :class="['littleboi-wrapper','catflex', season]">
			<div v-for="user in users" :key="user.name" :style="user.style" class="littleboi">
				<div class="message-wrapper catflex around">
					<div
						v-for="message in user.messages"
						:key="message.key"
						:class="message.class"
					>{{message.message}}</div>
				</div>
				<little-boi-sprite :state="user.state" :style="`filter: url(#lb-${user.name})`" />
				<svg>
					<filter :id="`lb-${user.name}`">
						<feColorMatrix type="matrix" :values="user.matrix" />
					</filter>
				</svg>
			</div>
		</div>
	</div>
</template>

<script>
import LittleBoiSprite from '~/components/LittleBoiSprite.vue';

class User {
	constructor(name, color) {
		this.name = name;
		this.color = color;
		this.matrix = '';
		this.setColor(this.color);
		this.setMatrix();

		this.mx = 725;
		this.mz = 50;

		this.r = 0;
		this.g = 0;
		this.b = 0;

		this.vx = this.randInt(8);
		this.vy = 10;
		this.x = this.randInt(this.mx);
		this.y = 1000;
		this.z = this.randInt(this.mz);

		this.dx = 0;
		this.dz = 0;

		this.moving = false;
		this.message = '';
		this.messageHidden = true;

		this.messages = [];
		this.queue = [];
		this.messageTimeout = null;

		this.leavePromise = null;
		this.leaveRej = null;

		this.i = 0;

		this.state = 'IDLE';
	}

	async queueMessage(m) {}

	async addMessage(message) {
		let c = {
			message: true,
			hidden: true,
			disabled: true,
		};
		let res;
		let p = new Promise(r => (res = r));
		let m = {
			key: ++this.i,
			message,
			class: c,
			res,
		};
		this.messages.push(m);
		await p;
		m.res = null;
		c.disabled = false;
		await this.sleep(5);
		c.hidden = false;
		await this.sleep(5000);
		c.hidden = true;
		await this.sleep(1000);
		console.log(this.messages);
		// this.messages.shift();
		this.messages.splice(this.messages.indexOf(m), 1);
	}

	leave() {
		return new Promise((res, rej) => {
			this.leavePromise = res;
			this.leaveRej = rej;

			this.dx = -100;
			this.dz = this.z;
			this.vx = 2;
			this.moving = true;
			this.state = 'WALK';
		});
	}
	sleep(time = 1000) {
		return new Promise(res => setTimeout(res, time));
	}

	get dimension() {
		return 50 + this.z / 2;
	}

	get messageClass() {
		return {
			message: true,
			hidden: this.messageHidden,
		};
	}

	get style() {
		return {
			// filter: `url(#lb-${this.name})`,
			bottom: this.y + (50 - this.z) / 2 + 68 + 'px',
			left: this.x + 'px',
			width: this.dimension + 'px',
			height: this.dimension + 'px',
			'z-index': this.z * 10 + 100,
		};
	}

	setColor(c) {
		let color;
		if (!c) {
			this.setRGB(
				this.randInt(255) / 255,
				this.randInt(255) / 255,
				this.randInt(255) / 255
			);
		} else {
			color = c.replace(/[^0-9A-F]/gi, '');
			console.log(c);

			this.setRGB(
				parseInt(color.substring(0, 2), 16) / 255,
				parseInt(color.substring(2, 4), 16) / 255,
				parseInt(color.substring(4, 6), 16) / 255
			);
		}
	}

	setRGB(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
	}

	setMatrix() {
		const matrix = [
			[this.r, 0, 0, 0, 0].join(' '),
			[0, this.g, 0, 0, 0].join(' '),
			[0, 0, this.b, 0, 0].join(' '),
			[0, 0, 0, 1, 0].join(' '),
		].join('\n');

		this.matrix = matrix;
	}

	genDestination() {
		let disx = this.randInt(-50, 50);
		let disz = this.randInt(-50, 50);
		this.dx = Math.min(this.mx - 20, Math.max(20, this.x + disx));
		this.dz = Math.min(this.mz - 20, Math.max(20, this.z + disz));
		// console.log(this.name, 'pos', this.dx, this.dz);

		let s1 = Math.abs(Math.max(this.dx, this.x) - Math.min(this.dx, this.x));
		let s2 = Math.abs(Math.max(this.dz, this.z) - Math.min(this.dz, this.z));
		let h = Math.sqrt(s1 ** 2 + s2 ** 2);
		let v = Math.max(s1, s2, h) / 40;
		let a = Math.tan(s1, s2);

		this.vz = Math.max(0.5, Math.abs(Math.sin(a) * v));
		this.vx = Math.max(0.5, Math.abs(Math.cos(a) * v));

		// console.log(this.name, s1, s2, h, a, this.vx, this.vz);
		// this.vx = hx;
		// this.vz = hz;
		// this.vx = 1;
		// this.vz = 1;
		// console.log('aaa', hx, hz);
		// this.vx = Math.max(this.dx, this.x) / Math.min(this.dx, this.x) / 5;
		// this.vz = Math.max(this.dz, this.z) / Math.min(this.dz, this.z) / 20;

		// console.log(this.vx, this.vz);
	}

	eventLoop() {
		if (this.y > 0) {
			this.y = Math.max(0, this.y - this.vy);
		} else {
			if (this.moving) {
				if (this.x > this.dx) {
					this.x = Math.max(this.dx, this.x - this.vx);
				} else if (this.x < this.dx) {
					this.x = Math.min(this.dx, this.x + this.vx);
				}

				if (this.z > this.dz) {
					this.z = Math.max(this.dz, this.z - this.vz);
				} else if (this.z < this.dz) {
					this.z = Math.min(this.dz, this.z + this.vz);
				}

				// console.log(this.name, this.x, this.dx, this.z, this.dz);
				if (this.x === this.dx && this.z === this.dz) {
					this.moving = false;
					this.state = 'IDLE';

					if (this.leavePromise) {
						this.leavePromise();
					}
				}
			} else {
				if (this.randInt(200) === 1) {
					this.genDestination();
					this.moving = true;
					this.state = 'WALK';
				}
			}
		}

		if (this.messages.length > 0) {
			for (const m of this.messages.slice(0, 3)) {
				if (m.res) m.res();
			}
		}

		// if (this.messages.length > 0 && !this.messageTimeout) {
		// 	this.message = this.messages.shift();
		// 	this.messageHidden = false;
		// 	this.messageTimeout = setTimeout(async () => {
		// 		this.messageHidden = true;
		// 		await this.sleep(1000);
		// 		this.message = '';
		// 		this.messageTimeout = null;
		// 	}, 5000);
		// }
	}

	randInt(min, max) {
		let mn = 0,
			mx;
		if (!max) mx = min;
		else {
			(mn = min), (mx = max);
		}
		return Math.floor(Math.random() * (mx - mn)) + mn;
	}

	setVelocity(vx) {
		this.vx = vx;
	}

	setCoords(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}
}

export default {
	components: { LittleBoiSprite },
	data() {
		return {
			users: [
				// new User('test'), new User('test2'), new User('test3')
			],
			vy: 5,
			eventInterval: null,
			seasons: ['fall', 'winter', 'spring'],
			season: null,
		};
	},
	mounted() {
		if (process.client) {
			this.season = this.seasons[
				Math.floor(Math.random() * this.seasons.length)
			];
			this.eventInterval = setInterval(this.eventLoop, 50);

			this.$ws.on('WELCOME', this.userJoin.bind(this));
			this.$ws.on('MESSAGE', this.userMessage.bind(this));
			this.$ws.on('FAREWELL', this.userLeave.bind(this));
		}
	},
	beforeDestroy() {
		clearInterval(this.eventInterval);
		this.$ws.removeListener('WELCOME', this.userJoin.bind(this));
		this.$ws.removeListener('MESSAGE', this.userMessage.bind(this));
		this.$ws.removeListener('FAREWELL', this.userLeave.bind(this));
	},
	methods: {
		userJoin({ name, color }) {
			let user = this.users.find(u => u.name === name);
			if (!user) {
				user = new User(name, color);
				this.users.push(user);
			} else {
				if (user.leavePromise) {
					user.leaveRej();
					user.moving = false;
					user.state = 'IDLE';
					user.dx = user.x;
					user.dz = user.z;
				}
			}
			return user;
		},
		userMessage({ name, text, color }) {
			let user = this.users.find(u => u.name === name);
			if (!user) user = this.userJoin({ name, color });
			if (user.leavePromise) {
				user.leaveRej();
				user.moving = false;
				user.state = 'IDLE';
				user.dx = user.x;
				user.dz = user.z;
			}
			user.addMessage(text);
		},
		async userLeave({ name }) {
			console.log('farewell,', name, '!');
			let user = this.users.find(u => u.name === name);
			if (user) {
				try {
					await user.leave();
					console.log("they're gone now");
					this.users.splice(this.users.indexOf(user), 1);
				} catch (err) {}
			}
		},
		randInt(min, max) {
			let mn = 0,
				mx;
			if (!max) mx = min;
			else {
				(mn = min), (mx = max);
			}
			return Math.floor(Math.random() * (mx - mn)) + mn;
		},
		eventLoop() {
			for (const user of this.users) {
				user.eventLoop();
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.littleboi-wrapper {
  position: relative;
  // height: 100%;
  // width: 100%;
  background-size: cover;
  margin-bottom: -68px;

  height: 192px;
  width: 800px;

  &.spring {
    background-image: url("/img/littleboi/back-spring.png");
  }
  &.fall {
    background-image: url("/img/littleboi/back-fall.gif");
  }
  &.winter {
    background-image: url("/img/littleboi/back-winter.png");
  }
}

.littleboi {
  position: absolute;

  img {
    height: 100%;
    width: 100%;
  }
}

.message-wrapper {
  position: absolute;
  bottom: 65px;
  left: -500px;
  right: -500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.message {
  /* autoprefixer: off */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.message {
  // max-width: 100px;
  text-align: left;
  max-width: 300px;
  color: black;
  max-height: 60px;
  line-height: 20px;
  overflow: hidden;
  background-image: url("/img/littleboi/bubble-background.png");
  background-repeat: repeat;
  background-size: 32px 32px;
  border: 2px solid black;
  text-overflow: ellipsis;
  padding: 0.2rem 0.5rem;
  transition: opacity 1s;
  margin-top: 0.2rem;

  position: relative;
  border-radius: 0.4em;
  &.disabled {
    display: none;
  }
  &.hidden {
    opacity: 0;
  }
}
</style>
