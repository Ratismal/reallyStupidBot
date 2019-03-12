<template>
	<div>
		<div class='littleboi-wrapper catflex'>
			<div v-for="user in users" :key="user.name" :style="user.style" class='littleboi'>
				<div :class="user.messageClass">
					{{user.message}}
				</div>
				<img src='/img/littleboi/test.gif'>
				<svg>
					<filter :id="`lb-${user.name}`">
						<feColorMatrix type="matrix"
							:values="user.matrix"/>
							<!-- 0.393 0.769 0.189 0 0
							0.349 0.686 0.168 0 0
							0.272 0.534 0.131 0 0
							0   0   0   1 0 -->
					</filter>
				</svg>
			</div>

		</div>
	</div>
</template>

<script>
class User {
	constructor(name, color) {
		this.name = name;
		this.color = color;
		this.matrix = '';
		this.setColor(this.color);
		this.setMatrix();

		this.mx = 800;
		this.mz = 50;

		this.r = 0;
		this.g = 0;
		this.b = 0;

		this.vx = this.randInt(8);
		this.vy = 5;
		this.x = this.randInt(this.mx);
		this.y = this.randInt(300);
		this.z = this.randInt(this.mz);

		this.dx = 0;
		this.dz = 0;

		this.moving = false;
		this.message = '';
	}

	addMessage(message) {}

	leave() {}

	setMessage(message) {
		this.message = message;
		return this;
	}

	get dimension() {
		return 50 + this.z / 2;
	}

	get messageClass() {
		return {
			message: true,
			hidden: !this.message,
		};
	}

	get style() {
		return {
			filter: `url(#lb-${this.name})`,
			bottom: this.y + (50 - this.z) / 2 + 'px',
			left: this.x + 'px',
			width: this.dimension + 'px',
			height: this.dimension + 'px',
			'z-index': this.z * 10 + 100,
		};
	}

	setColor(c) {
		let color = c.replace(/[^0-9A-F]/gi, '');
		this.setRGB(
			parseInt(color.substring(0, 2), 16) / 255,
			parseInt(color.substring(2, 4), 16) / 255,
			parseInt(color.substring(2, 6), 16) / 255
		);
	}

	setRGB(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
	}

	setMatrix() {
		const matrix = `${1 - this.r} 0 0 0 ${this.r}
${1 - this.g} 0 0 0 ${this.g}
${1 - this.b} 0 0 0 ${this.b}
0    0 0 1 0`;
		this.matrix = matrix;
	}

	genDestination() {
		let disx = this.randInt(-50, 50);
		let disz = this.randInt(-50, 50);
		this.dx = Math.min(this.mx, Math.max(0, this.x + disx));
		this.dz = Math.min(this.mz, Math.max(0, this.z + disz));
		console.log(this.name, 'pos', this.dx, this.dz);

		let s1 = Math.abs(Math.max(this.dx, this.x) - Math.min(this.dx, this.x));
		let s2 = Math.abs(Math.max(this.dz, this.z) - Math.min(this.dz, this.z));
		let h = Math.sqrt(s1 ** 2 + s2 ** 2);
		let v = h / 40;
		let a = Math.tan(s1, s2);

		this.vz = Math.abs(Math.sin(a) * v);
		this.vx = Math.abs(Math.cos(a) * v);

		console.log(this.name, s1, s2, h, a, this.vx, this.vz);
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
				} else if (this.z < this.dx) {
					this.z = Math.min(this.dz, this.z + this.vz);
				}

				if (this.x === this.dx && this.z === this.dz) {
					this.moving = false;
				}
			} else {
				if (this.randInt(200) === 1) {
					this.genDestination();
					this.moving = true;
				}
			}
		}
	}

	randInt(min, max) {
		let mn = 0,
			mx;
		if (!max) mx = min;
		else {
			(mn = min), (mx = max);
		}
		return Math.floor(Math.random() * mx) + mn;
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
	data() {
		return {
			users: [
				new User('test', '#FF0088').setMessage('hi'),
				new User('test2', '#808800'),
				new User('test3', '#abcd00'),
			],
			vy: 5,
			eventInterval: null,
		};
	},
	mounted() {
		if (process.client) {
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
			}
			return user;
		},
		userMessage({ name, text, color }) {
			let user = this.users.find(u => u.name === name);
			if (!user) user = this.userJoin({ name, color });
			user.addMessage(text);
		},
		userLeave({ name }) {
			let user = this.users.find(u => u.name === name);
			if (user) user.leave();
		},
		randInt(min, max) {
			let mn = 0,
				mx;
			if (!max) mx = min;
			else {
				(mn = min), (mx = max);
			}
			return Math.floor(Math.random() * mx) + mn;
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
  height: 100%;
  width: 100%;
}

.littleboi {
  position: absolute;

  img {
    height: 100%;
    width: 100%;
  }
}

.message {
  position: absolute;
  top: -30px;
  left: -20px;
  right: -20px;
  text-align: center;
  display: block;
  color: black;
  height: 20px;
  background: white;

  &.hidden {
    opacity: 0;
  }
}
</style>
