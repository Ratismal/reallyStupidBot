require('module-alias/register');

import start from './server';

start().catch(err => {
	console.error('Error encountered while initializing Bento:', err);
	process.exit(1);
});