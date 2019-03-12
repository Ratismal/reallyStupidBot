import Vue from 'vue';
import EventEmitter from 'eventemitter3';

class WebsocketManager extends EventEmitter {
	constructor() {
		super();
		this.client = null;
	}

	connect() {
		if (process.client) {
			let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
			let url = protocol + window.location.host;

			this.client = new WebSocket(url);

			this.client.onopen = this.onOpen.bind(this);
			this.client.onclose = this.onClose.bind(this);
			this.client.onerror = this.onError.bind(this);
			this.client.onmessage = this.onMessage.bind(this);
		}
	}

	async onOpen() {
		console.log('Websocket opened');
		this.emit('open');
	}

	async onClose() {
		console.log('Websocket closed. Reconnecting in 5 seconds...');
		this.emit('close');

		setTimeout(this.connect.bind(this), 5000);
	}

	async onMessage(msg) {
		try {
			let obj = JSON.parse(msg.data);

			this.emit(obj.code, obj);
			this.emit('message', obj);
		} catch (err) {
			console.error(err);
		}
	}

	async onError(err) {
		console.error(err);
		this.emit('error', err);
	}

	sendMessage(msg) {
		const s = JSON.stringify(msg);
		console.log('Sending', s);
		this.client.send(s);
	}
}

Vue.prototype.$ws = new WebsocketManager();