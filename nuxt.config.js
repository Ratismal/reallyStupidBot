const config = require('./config.json');

module.exports = {
	head: { title: 'Really Stupid Bot' }, // Headers of the page
	srcDir: 'src/client',
	build: {
		extend(config, { isDev, isClient }) {
			if (isDev && isClient) {
				// Run ESLint on save
				config.module.rules.push({
					enforce: 'pre',
					test: /\.(js|vue)$/,
					loader: 'eslint-loader',
					exclude: /(node_modules)/,
				});
			}

			let plugin = config.plugins.find(p => {
				return p.constructor.name === 'WebpackBarPlugin';
			});
			let p = -1, m = 0;;
			plugin.handler = function (percent, msg) {
					percent = Math.floor(percent * 100);
					if (percent !== p && percent % 50 === 0) {
							(console.nuxt || console.log)(`Compiling ${isClient ? 'client' : 'server'}: ${percent}%`, msg);
							p = percent;
					}
			};
		},
		// quiet: true,
		postcss: {
			plugins: {
				'postcss-custom-properties': false,
			},
		},
	},
	plugins: [],
	dev: process.env.NODE_ENV === 'DEV',
	css: [
		'@/assets/scss/base.scss',
	],
	modules: [
		['@nuxtjs/axios', {
				prefix: '/api',
				proxy: true,
				port: 8067,
		}],
	],
	proxy: {
		'/api/': config.origin || 'http://localhost:3005',
	},
};
