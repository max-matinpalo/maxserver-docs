import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

// Oldest browsers of the browserslist in package.json.
const targets = ['chrome109', 'edge109', 'firefox115', 'safari15.6', 'ios15.6'];

export default defineConfig(({ command }) => ({
	plugins: [preact()],
	server: { port: 3002, strictPort: true },
	// Library builds keep process.env references; Preact must see production
	define: command === 'build' ? { 'process.env.NODE_ENV': JSON.stringify('production') } : {},
	build: {
		target: targets,
		cssTarget: targets,
		// One JS and one CSS file for embedding, e.g. in maxserver /docs
		lib: {
			entry: 'src/main.jsx',
			formats: ['es'],
			fileName: () => 'maxserver-docs.js',
			cssFileName: 'maxserver-docs',
		},
		// ES libs keep whitespace and @__PURE__ comments by default; browsers load this file directly
		rolldownOptions: { output: { minify: true, comments: false } },
	},
}));
