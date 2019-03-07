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
		},
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
};
