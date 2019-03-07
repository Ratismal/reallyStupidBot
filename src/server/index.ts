import { Bento, FSComponentLoader } from '@ayana/bento';

import Loggr from 'loggr';
const console = Loggr.get('Root');

import * as plugins from './plugins';
const bento = new Bento();
const config = require('../../config.json');

export default async function start() {
	console.init('Initializing...');
	bento.setVariable('_config', config);
	bento.setVariable('prefix', config.twitch.prefix);

	console.init('Loading CatBot...');

	console.init('Loading component loader...');
	const fsloader = new FSComponentLoader();
	await fsloader.addDirectory(__dirname, 'components');

	console.init('Loading plugins...');
	const _plugins = Object.values(plugins).map(p => new p());

	console.init('Adding plugins...');
	await bento.addPlugins([fsloader, ..._plugins]);
	console.init('Verifying...');
	await bento.verify();
	console.init('Done!');
}