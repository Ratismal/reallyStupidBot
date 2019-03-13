export default {
	props: {
		cache: {
			type: Boolean,
			defaultValue: false,
		},
		state: {
			type: String,
			defaultValue: 'IDLE',
		},
	},
	data() {
		return {
			states: {},
			compStates: {},
			current: null,
			lastTimeout: null,
			framePromise: null,
			active: true,
		};
	},
	mounted() {
		if (Array.isArray(this.current)) this.current = this.current[0];

		if (process.client && !this.cache) {
			for (const key in this.states) {
				let state = this.states[key];
				if (Array.isArray(state)) {
					let s = [];
					for (const _state of state) {
						let priority = 1;
						if (_state.priority) priority = _state.priority;
						for (let i = 0; i < priority; i++) {
							s.push(_state);
						}
					}
					this.compStates[key] = s;
				} else {
					this.compStates[key] = state;
				}
			}

			this.selectState();
			console.log(this.current);
			if (this.current)
				this.eventLoop();
		}
	},
	beforeDestroy() {
		if (this.framePromise)
			this.framePromise.reject();
		this.active = false;
	},
	computed: {
		allStates() {
			let states = [];
			for (const key in this.states) {
				if (Array.isArray(this.states[key])) states.push(...this.states[key]);
				else states.push(this.states[key]);
			}
			return states;
		},
	},
	watch: {
		state() {
			this.eventLoop();
		},
	},
	methods: {
		selectState() {
			let state = this.compStates[this.state];
			if (state) {
				if (Array.isArray(state)) {

					// get a random state
					state = state[Math.floor(Math.random() * state.length)];
				}
				this.current = state;
			}
		},
		sleep(time = 1600) {
			return new Promise(res => setTimeout(res, time));
		},
		async eventLoop() {
			// console.log('event loop');
			if (this.framePromise) {
				this.framePromise.reject();
				this.framePromise = null;
			}
			let _p;
			let p = new Promise(async (_res, _rej) => {
				_p = {
					resolve: _res,
					reject: _rej,
				};

				this.selectState();
				await this.sleep(this.current.duration);
				if (this.framePromise === _p)
					_res();
			});
			this.framePromise = _p;

			try {
				await p;
				this.framePromise = null;
				await this.eventLoop();
			} catch (err) {
				// NO-OP
			}
		},
	},
};